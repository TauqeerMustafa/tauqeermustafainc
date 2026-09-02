/**
 * Voice-note recorder for the WhatsApp console.
 *
 * The hard part isn't recording — it's the container. WhatsApp Cloud API accepts
 * audio as aac, amr, mpeg, mp4 or **ogg (Opus only)**, and every browser records
 * something different:
 *
 *   Firefox → audio/ogg;codecs=opus   ✅ send as-is
 *   Safari  → audio/mp4 (AAC)         ✅ send as-is
 *   Chrome  → audio/webm;codecs=opus  ❌ rejected by Meta
 *
 * Chrome and Edge cannot record Ogg at all (`isTypeSupported("audio/ogg;codecs=opus")`
 * is false), and they're the browsers this console actually runs in. So a Chrome
 * recording is repackaged into Ogg by `lib/opus-remux` — same Opus packets, new
 * container, no re-encode — before it goes anywhere near the upload route.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { webmOpusToOgg } from "@/lib/opus-remux";

/** In preference order: what we'd rather have, given the browser's a choice. */
const PREFERRED_TYPES = [
  "audio/ogg;codecs=opus",
  "audio/webm;codecs=opus",
  "audio/mp4",
  "audio/aac",
  "audio/mpeg",
];

/** Long enough for any voice note, short enough to stay under Meta's 16 MB cap. */
const MAX_SECONDS = 300;

export type VoiceRecording = {
  /** Ready to hand straight to `uploadWhatsAppMedia`. */
  file: File;
  seconds: number;
  /** True when a Chrome/Edge WebM recording was repackaged as Ogg. */
  remuxed: boolean;
};

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return PREFERRED_TYPES.find((type) => {
    try {
      return MediaRecorder.isTypeSupported(type);
    } catch {
      return false;
    }
  });
}

function extensionFor(mime: string): string {
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("mp4")) return "m4a";
  if (mime.includes("mpeg")) return "mp3";
  if (mime.includes("aac")) return "aac";
  return "webm";
}

export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const frameRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);

  /** Release the mic, the meter and the timers; safe to call repeatedly. */
  const teardown = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setLevel(0);
  }, []);

  useEffect(() => teardown, [teardown]);

  const start = useCallback(async (): Promise<boolean> => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("This browser cannot record audio.");
      return false;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch {
      // Almost always a denied permission prompt; say something actionable.
      setError("Microphone access was blocked. Allow it in your browser settings.");
      return false;
    }

    const mimeType = pickMimeType();
    let recorder: MediaRecorder;
    try {
      // No supported type in our list still means "record the default" — Safari
      // reports nothing supported yet happily produces mp4.
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch {
      stream.getTracks().forEach((track) => track.stop());
      setError("This browser cannot record audio.");
      return false;
    }

    chunksRef.current = [];
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size) chunksRef.current.push(event.data);
    });
    recorder.start();

    recorderRef.current = recorder;
    streamRef.current = stream;
    startedAtRef.current = Date.now();
    setSeconds(0);
    setRecording(true);

    // Live input level, so the admin can see the mic is actually hearing them.
    try {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      audioCtxRef.current = ctx;
      const samples = new Uint8Array(analyser.frequencyBinCount);
      const meter = () => {
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (let i = 0; i < samples.length; i++) {
          const deviation = (samples[i] - 128) / 128;
          sum += deviation * deviation;
        }
        setLevel(Math.min(1, Math.sqrt(sum / samples.length) * 3));
        frameRef.current = requestAnimationFrame(meter);
      };
      frameRef.current = requestAnimationFrame(meter);
    } catch {
      // A meter is a nicety; recording continues without it.
    }

    tickRef.current = setInterval(() => {
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      setSeconds(elapsed);
      if (elapsed >= MAX_SECONDS && recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
    }, 200);

    return true;
  }, []);

  /** Finish the recording and return an upload-ready file (null if empty). */
  const stop = useCallback(async (): Promise<VoiceRecording | null> => {
    const recorder = recorderRef.current;
    if (!recorder) return null;

    if (recorder.state !== "inactive") {
      await new Promise<void>((resolve) => {
        recorder.addEventListener("stop", () => resolve(), { once: true });
        recorder.stop();
      });
    }

    const elapsed = (Date.now() - startedAtRef.current) / 1000;
    recorderRef.current = null;
    teardown();
    setRecording(false);
    setSeconds(0);

    const chunks = chunksRef.current;
    chunksRef.current = [];
    if (!chunks.length) return null;

    const sourceType = recorder.mimeType || "audio/webm";
    const raw = new Blob(chunks, { type: sourceType });

    // Chrome/Edge: swap the WebM shell for an Ogg one so Meta accepts it.
    if (sourceType.includes("webm")) {
      try {
        const ogg = webmOpusToOgg(new Uint8Array(await raw.arrayBuffer()));
        return {
          file: new File([ogg as BlobPart], `voice-note-${Date.now()}.ogg`, { type: "audio/ogg" }),
          seconds: elapsed,
          remuxed: true,
        };
      } catch (remuxError) {
        // Send the original anyway: Meta's rejection message is more useful to
        // the admin than us silently dropping a recording they just made.
        console.error("[voice] WebM→Ogg remux failed, sending raw recording:", remuxError);
      }
    }

    const extension = extensionFor(sourceType);
    return {
      file: new File([raw], `voice-note-${Date.now()}.${extension}`, {
        type: sourceType.split(";")[0],
      }),
      seconds: elapsed,
      remuxed: false,
    };
  }, [teardown]);

  /** Throw the recording away without sending it. */
  const cancel = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    recorderRef.current = null;
    chunksRef.current = [];
    teardown();
    setRecording(false);
    setSeconds(0);
  }, [teardown]);

  return { recording, seconds, level, error, start, stop, cancel, maxSeconds: MAX_SECONDS };
}

/** m:ss for the recording timer and voice-note durations. */
export function formatDuration(totalSeconds: number): string {
  const whole = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(whole / 60);
  const seconds = whole % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
