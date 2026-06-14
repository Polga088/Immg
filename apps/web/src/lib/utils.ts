import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Works on HTTP (non-localhost) where crypto.randomUUID is unavailable. */
export function generateMessageId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // insecure context (e.g. http://IP:port)
    }
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
