"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * Portal theme switch — the lever behind "white and dark mode acc to user dev".
 *
 * `ThemeProvider` runs with `defaultTheme="system"`, so a first-time visitor
 * already gets their OS preference; this only exists to override it. Styled on
 * the `--adm-*` tokens (not the site's `--ink`) so it belongs to the portal
 * chrome, and round because the house rule puts icon-only buttons on pills.
 */

const emptySubscribe = () => () => {};

// next-themes resolves the active theme client-side only. This reports `false`
// for the server render (and React's first hydration pass) then `true`, so the
// real icon swaps in without a setState-in-effect or a hydration mismatch.
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export default function PortalThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = resolvedTheme === "dark";

  const base =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-adm-border text-adm-text-2 transition hover:bg-adm-surface-2 hover:text-adm-text";

  if (!mounted) {
    // Placeholder keeps the header from shifting before the theme is known.
    return <span className={`${base} ${className}`} aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      className={`${base} ${className}`}
    >
      {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
    </button>
  );
}
