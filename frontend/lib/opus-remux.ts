/**
 * Repackage a WebM/Opus recording as Ogg/Opus — in the browser, with no
 * dependency and without re-encoding a single sample.
 *
 * WHY THIS EXISTS
 * ───────────────
 * A WhatsApp voice note has to be `audio/ogg` carrying an Opus stream; Meta's
 * media upload rejects anything else as an unsupported type. But `MediaRecorder`
 * only produces `audio/webm;codecs=opus` in Chrome and Edge (Firefox can do
 * ogg/opus, Safari does mp4/aac), so a note recorded in Chrome — the browser the
 * admin console is actually used in — could never be sent.
 *
 * Both containers wrap the *same* Opus packets. So this walks the Matroska
 * blocks, lifts the packets out, and writes them into Ogg pages: a container
 * swap, not a transcode. Runs in a few milliseconds for a minute of audio.
 *
 * Verified end to end against ffmpeg-produced fixtures (see lib/__tests__).
 */

/* ── EBML / Matroska ───────────────────────────────────────────────────────── */

const ID_EBML = 0x1a45dfa3;
const ID_SEGMENT = 0x18538067;
const ID_INFO = 0x1549a966;
const ID_TIMECODE_SCALE = 0x2ad7b1;
const ID_DURATION = 0x4489;
const ID_TRACKS = 0x1654ae6b;
const ID_TRACK_ENTRY = 0xae;
const ID_CODEC_PRIVATE = 0x63a2;
const ID_CLUSTER = 0x1f43b675;
const ID_BLOCK_GROUP = 0xa0;
const ID_SIMPLE_BLOCK = 0xa3;
const ID_BLOCK = 0xa1;

/** Master elements we descend into; everything else is skipped by its size. */
const MASTERS = new Set([
  ID_SEGMENT,
  ID_INFO,
  ID_TRACKS,
  ID_TRACK_ENTRY,
  ID_CLUSTER,
  ID_BLOCK_GROUP,
]);

/** Read an element id: length comes from the leading-zero count, marker kept. */
function readId(buf: Uint8Array, pos: number): { id: number; next: number } {
  const first = buf[pos];
  if (first === undefined) throw new Error("Truncated WebM: element id");
  let length = 1;
  for (let mask = 0x80; mask && !(first & mask); mask >>= 1) length++;
  if (length > 4) throw new Error("Invalid WebM element id");
  let id = 0;
  for (let i = 0; i < length; i++) id = id * 256 + buf[pos + i];
  return { id, next: pos + length };
}

/** Read a size vint. `size === null` means "unknown length" (live recordings). */
function readSize(buf: Uint8Array, pos: number): { size: number | null; next: number } {
  const first = buf[pos];
  if (first === undefined) throw new Error("Truncated WebM: element size");
  let length = 1;
  for (let mask = 0x80; mask && !(first & mask); mask >>= 1) length++;
  if (length > 8) throw new Error("Invalid WebM element size");
  let size = first & (0xff >> length);
  let allOnes = size === (0xff >> length);
  for (let i = 1; i < length; i++) {
    const byte = buf[pos + i];
    if (byte !== 0xff) allOnes = false;
    size = size * 256 + byte;
  }
  return { size: allOnes ? null : size, next: pos + length };
}

/** Frames carried by one SimpleBlock/Block, ignoring the 4-byte block header. */
function blockFrames(buf: Uint8Array, start: number, end: number): Uint8Array[] {
  let pos = start;
  const { next } = readSize(buf, pos); // track number, value unused
  pos = next + 2; // int16 relative timecode
  const flags = buf[pos];
  pos += 1;
  const lacing = (flags >> 1) & 0x03;

  if (lacing === 0) return [buf.subarray(pos, end)];
  // Fixed-size lacing: (count+1) equal frames.
  if (lacing === 2) {
    const count = buf[pos] + 1;
    pos += 1;
    const each = Math.floor((end - pos) / count);
    const out: Uint8Array[] = [];
    for (let i = 0; i < count; i++) out.push(buf.subarray(pos + i * each, pos + (i + 1) * each));
    return out;
  }
  // MediaRecorder never laces audio with Xiph/EBML; refuse rather than emit a
  // silently corrupt file so the caller can fall back to the raw recording.
  throw new Error("Unsupported WebM lacing in audio block");
}

interface WebmAudio {
  packets: Uint8Array[];
  /** CodecPrivate — the OpusHead the encoder wrote, when present. */
  head: Uint8Array | null;
  /** Declared duration in milliseconds, when the file states one. */
  durationMs: number | null;
}

/** Big-endian unsigned integer of 1–8 bytes (Matroska's uint encoding). */
function readUint(buf: Uint8Array, from: number, to: number): number {
  let value = 0;
  for (let i = from; i < to; i++) value = value * 256 + buf[i];
  return value;
}

function parseWebmOpus(buf: Uint8Array): WebmAudio {
  const packets: Uint8Array[] = [];
  let head: Uint8Array | null = null;
  let timecodeScale = 1_000_000; // nanoseconds per tick; Matroska's default
  let durationTicks: number | null = null;

  const walk = (from: number, to: number): void => {
    let pos = from;
    while (pos < to) {
      const { id, next: afterId } = readId(buf, pos);
      const { size, next: afterSize } = readSize(buf, afterId);
      // An unknown-size master runs to the end of its parent.
      const end = size === null ? to : Math.min(afterSize + size, to);

      if (id === ID_EBML) {
        pos = end;
        continue;
      }
      if (MASTERS.has(id)) {
        walk(afterSize, end);
      } else if (id === ID_CODEC_PRIVATE) {
        if (!head) head = buf.subarray(afterSize, end);
      } else if (id === ID_TIMECODE_SCALE) {
        const scale = readUint(buf, afterSize, end);
        if (scale > 0) timecodeScale = scale;
      } else if (id === ID_DURATION) {
        // Matroska stores Duration as a float, in TimecodeScale units.
        const width = end - afterSize;
        const view = new DataView(buf.buffer, buf.byteOffset + afterSize, width);
        if (width === 4) durationTicks = view.getFloat32(0);
        else if (width === 8) durationTicks = view.getFloat64(0);
      } else if (id === ID_SIMPLE_BLOCK || id === ID_BLOCK) {
        for (const frame of blockFrames(buf, afterSize, end)) {
          if (frame.length) packets.push(frame);
        }
      }
      if (end <= pos) throw new Error("Malformed WebM: element made no progress");
      pos = end;
    }
  };

  walk(0, buf.length);
  return {
    packets,
    head,
    durationMs: durationTicks === null ? null : (durationTicks * timecodeScale) / 1e6,
  };
}

/* ── Opus packet timing ────────────────────────────────────────────────────── */

/** Samples (at 48 kHz) in one Opus packet, read from its TOC byte. */
export function opusPacketSamples(packet: Uint8Array): number {
  if (!packet.length) return 0;
  const toc = packet[0];
  const config = toc >> 3;
  const code = toc & 0x03;

  const ms =
    config < 12
      ? [10, 20, 40, 60][config & 0x03]
      : config < 16
        ? [10, 20][config & 0x01]
        : [2.5, 5, 10, 20][config & 0x03];

  const frames = code === 0 ? 1 : code < 3 ? 2 : (packet[1] ?? 0) & 0x3f;
  return Math.round(ms * 48) * Math.max(frames, 1);
}

/* ── Ogg writing ───────────────────────────────────────────────────────────── */

/** Ogg's CRC-32: poly 0x04c11db7, no reflection, no init/final xor. */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let crc = i << 24;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x80000000 ? ((crc << 1) ^ 0x04c11db7) >>> 0 : (crc << 1) >>> 0;
    }
    table[i] = crc >>> 0;
  }
  return table;
})();

function oggCrc(bytes: Uint8Array): number {
  let crc = 0;
  for (let i = 0; i < bytes.length; i++) {
    crc = ((crc << 8) ^ CRC_TABLE[((crc >>> 24) ^ bytes[i]) & 0xff]) >>> 0;
  }
  return crc >>> 0;
}

function ascii(text: string): Uint8Array {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) out[i] = text.charCodeAt(i) & 0x7f;
  return out;
}

/** Lacing values for one packet: 255-byte runs, then the remainder. */
function lacing(length: number): number[] {
  const values: number[] = [];
  let left = length;
  while (left >= 255) {
    values.push(255);
    left -= 255;
  }
  values.push(left);
  return values;
}

function buildPage(
  packets: Uint8Array[],
  headerType: number,
  granule: number,
  serial: number,
  sequence: number,
): Uint8Array {
  const segments: number[] = [];
  for (const packet of packets) segments.push(...lacing(packet.length));
  if (segments.length > 255) throw new Error("Ogg page overflow");

  const bodyLength = packets.reduce((total, p) => total + p.length, 0);
  const page = new Uint8Array(27 + segments.length + bodyLength);
  const view = new DataView(page.buffer);

  page.set(ascii("OggS"), 0);
  page[4] = 0; // stream structure version
  page[5] = headerType;
  // Granule position is 64-bit; audio never gets near 2^53 samples.
  view.setUint32(6, granule >>> 0, true);
  view.setUint32(10, Math.floor(granule / 0x100000000), true);
  view.setUint32(14, serial >>> 0, true);
  view.setUint32(18, sequence >>> 0, true);
  view.setUint32(22, 0, true); // CRC placeholder
  page[26] = segments.length;
  page.set(segments, 27);

  let offset = 27 + segments.length;
  for (const packet of packets) {
    page.set(packet, offset);
    offset += packet.length;
  }

  view.setUint32(22, oggCrc(page), true);
  return page;
}

function defaultOpusHead(channels = 1): Uint8Array {
  const head = new Uint8Array(19);
  head.set(ascii("OpusHead"), 0);
  head[8] = 1; // version
  head[9] = channels;
  new DataView(head.buffer).setUint16(10, 3840, true); // pre-skip
  new DataView(head.buffer).setUint32(12, 48000, true); // original rate
  return head; // output gain 0, channel mapping family 0
}

function opusTags(): Uint8Array {
  const vendor = ascii("tauqeer-inc webm→ogg remux");
  const tags = new Uint8Array(8 + 4 + vendor.length + 4);
  tags.set(ascii("OpusTags"), 0);
  const view = new DataView(tags.buffer);
  view.setUint32(8, vendor.length, true);
  tags.set(vendor, 12);
  view.setUint32(12 + vendor.length, 0, true); // no comments
  return tags;
}

/**
 * Convert a `audio/webm;codecs=opus` recording into `audio/ogg` bytes.
 * Throws when the input is not a WebM Opus stream, so callers can fall back.
 */
export function webmOpusToOgg(input: Uint8Array): Uint8Array {
  const { packets, head, durationMs } = parseWebmOpus(input);
  if (!packets.length) throw new Error("No Opus packets found in the recording");

  const opusHead =
    head && head.length >= 19 && String.fromCharCode(...head.subarray(0, 8)) === "OpusHead"
      ? head
      : defaultOpusHead();

  // Pre-skip is counted inside every granule position, so end-trimming has to
  // add it back: a player renders (final granule − pre-skip) samples.
  const preSkip = new DataView(
    opusHead.buffer,
    opusHead.byteOffset,
    opusHead.byteLength,
  ).getUint16(10, true);
  const cap =
    durationMs && durationMs > 0 ? preSkip + Math.round((durationMs * 48000) / 1000) : null;

  const serial = (Math.random() * 0xffffffff) >>> 0;
  const pages: Uint8Array[] = [];
  let sequence = 0;

  pages.push(buildPage([opusHead], 0x02, 0, serial, sequence++)); // BOS
  pages.push(buildPage([opusTags()], 0x00, 0, serial, sequence++));

  // Audio pages: cap segments at 255 and keep each page comfortably small so
  // players can seek; granule is the sample count through the page's last packet.
  let granule = 0;
  let batch: Uint8Array[] = [];
  let batchSegments = 0;

  const flush = (isLast: boolean) => {
    if (!batch.length) return;
    // The encoder pads the last packet out to a whole frame. Trimming the final
    // granule back to the declared duration stops players reporting a voice note
    // as ~14 ms longer than it is (and stops them playing the padding).
    const position = isLast && cap !== null ? Math.min(granule, cap) : granule;
    pages.push(buildPage(batch, isLast ? 0x04 : 0x00, position, serial, sequence++));
    batch = [];
    batchSegments = 0;
  };

  for (let i = 0; i < packets.length; i++) {
    const packet = packets[i];
    const needed = lacing(packet.length).length;
    if (batchSegments + needed > 255) flush(false);
    batch.push(packet);
    batchSegments += needed;
    granule += opusPacketSamples(packet);
    if (i === packets.length - 1) flush(true);
  }

  const total = pages.reduce((sum, page) => sum + page.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const page of pages) {
    out.set(page, offset);
    offset += page.length;
  }
  return out;
}
