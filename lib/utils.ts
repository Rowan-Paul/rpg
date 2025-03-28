import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function estimateSpeechDuration(text: string, wordsPerMinute = 150): number {
  const wordCount = text.split(/\s+/).length
  return (wordCount / wordsPerMinute) * 60 * 1000 // Duration in milliseconds
}

