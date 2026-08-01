"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AUDIO_BUCKET } from "@/lib/storage";

export { AUDIO_BUCKET };

/** Signed URLs are short-lived; refresh a little before they expire. */
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export function useAudioUrl(path: string | null) {
  return useQuery({
    queryKey: ["audio-url", path],
    enabled: Boolean(path),
    staleTime: (SIGNED_URL_TTL_SECONDS - 300) * 1000,
    queryFn: async (): Promise<string> => {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from(AUDIO_BUCKET)
        .createSignedUrl(path!, SIGNED_URL_TTL_SECONDS);
      if (error) throw new Error(error.message);
      return data.signedUrl;
    },
  });
}

/**
 * Objects are stored under the owner's user id so the Storage RLS policies can
 * key off the first path segment.
 */
export function audioObjectPath(userId: string, extension: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const random = Math.random().toString(36).slice(2, 8);
  return `${userId}/${stamp}-${random}.${extension}`;
}

export async function uploadNoteAudio(
  userId: string,
  blob: Blob,
  extension: string
): Promise<string> {
  const supabase = createClient();
  const path = audioObjectPath(userId, extension);
  const { error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(path, blob, {
      contentType: blob.type || "application/octet-stream",
      upsert: false,
    });
  if (error) throw new Error(error.message);
  return path;
}
