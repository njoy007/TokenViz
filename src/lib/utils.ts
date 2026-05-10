import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate deterministic colors based on a string
export function getStringColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  const s = 60 + Math.abs(hash) % 30; // 60-90%
  const l = 40 + Math.abs(hash) % 20; // 40-60%
  return `hsl(${h}, ${s}%, ${l}%)`;
}
