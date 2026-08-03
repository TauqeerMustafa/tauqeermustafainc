import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Estimates reading time from an array of paragraphs at ~200 words/minute,
 * the standard baseline for adult reading speed on web content.
 */
export function readingTime(paragraphs: string[]): string {
  const words = paragraphs.join(" ").trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min read`
}
