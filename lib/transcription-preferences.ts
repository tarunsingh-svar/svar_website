import { AUTO_CODE, languageByCode } from "@/lib/transcription-languages";

const STORAGE_KEY = "transcription_language";
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

/** Subscribe to language preference changes (same tab or others). */
export function subscribeLanguagePreference(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStoreChange);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStoreChange);
    }
  };
}

/** The user's pinned transcription language, or `auto`. */
export function getLanguageCode(): string {
  if (typeof window === "undefined") return AUTO_CODE;
  return localStorage.getItem(STORAGE_KEY) ?? AUTO_CODE;
}

export function setLanguageCode(code: string): void {
  localStorage.setItem(STORAGE_KEY, code);
  emitChange();
}

export function getLanguage() {
  return languageByCode(getLanguageCode());
}

/** Browser locale as a BCP-47 tag, e.g. `en-IN` or `de`. Matches the mobile app. */
export function getDeviceLocale(): string {
  if (typeof navigator === "undefined") return "en";
  return navigator.language.replace("_", "-");
}

/** First tag from an Accept-Language header, for server-side fallback. */
export function localeFromAcceptLanguage(header: string | null): string | undefined {
  if (!header) return undefined;
  const first = header.split(",")[0]?.trim();
  if (!first) return undefined;
  return first.split(";")[0]?.trim().replace("_", "-") || undefined;
}
