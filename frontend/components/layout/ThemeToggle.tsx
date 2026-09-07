"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/* ── BMW M theme switch — follows the OS on first visit, then remembers.
   Square utility button in the navbar language; icon rides on --ink so it
   stays legible in both themes. ── */

const emptySubscribe = () => () => {};
// next-themes resolves the active theme only on the client — this reports
// `false` for the server render (and React's first hydration pass) and
// `true` right after, so the real icon swaps in without a setState-in-effect
// (and without risking a hydration mismatch).
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = resolvedTheme === "dark";

  const base =
    "flex h-11 w-11 shrink-0 items-center justify-center border border-ink/15 bg-ink/[0.05] text-ink transition-colors hover:bg-ink/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action";

  if (!mounted) {
    // Placeholder keeps layout stable before the theme is known.
    return <span className={`${base} ${className}`} aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      className={`${base} ${className}`}
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden />
      ) : (
        <Moon className="h-5 w-5" aria-hidden />
      )}
    </button>
  );
}
