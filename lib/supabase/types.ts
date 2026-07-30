/**
 * Hand-maintained schema types for the SVAR Supabase project.
 *
 * Mirrors svar_ai/supabase/migrations. Regenerate with
 * `supabase gen types typescript` once the CLI is wired into this repo.
 *
 * These are type aliases rather than interfaces on purpose: postgrest-js
 * constrains tables to `Record<string, unknown>`, and only type aliases get an
 * implicit index signature. Interfaces here silently resolve every query to
 * `never`.
 */

export type Entitlement = "free" | "pro";
export type Plan = "monthly" | "yearly" | "lifetime";

export type TranscribeRow = {
  id: number;
  user_id: string;
  title: string | null;
  transcribe_text: string | null;
  summary_text: string | null;
  duration_seconds: number;
  tags: string[] | null;
  /** Storage object path in the `note-audio` bucket. Null for manual notes. */
  audio_path: string | null;
  created_at: string;
  updated_at: string | null;
};

export type UserDetailsRow = {
  user_id: string;
  email: string;
  name: string | null;
  age: string | null;
  profession: string | null;
  usage: string | null;
};

export type ProfileRow = {
  user_id: string;
  entitlement: Entitlement;
  plan: Plan | null;
  is_lifetime: boolean;
  pro_expires_at: string | null;
  rc_app_user_id: string | null;
  notes_created_count: number;
  created_at: string;
  updated_at: string;
};

export type WaitlistRow = {
  id: string;
  email: string;
  source: string | null;
  user_agent: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      transcribe: {
        Row: TranscribeRow;
        Insert: Omit<TranscribeRow, "id" | "created_at" | "updated_at"> &
          Partial<Pick<TranscribeRow, "created_at" | "updated_at">>;
        Update: Partial<Omit<TranscribeRow, "id" | "user_id">>;
        Relationships: [];
      };
      user_details: {
        Row: UserDetailsRow;
        Insert: Pick<UserDetailsRow, "user_id" | "email"> &
          Partial<UserDetailsRow>;
        Update: Partial<UserDetailsRow>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, "user_id">;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      waitlist: {
        Row: WaitlistRow;
        Insert: Omit<WaitlistRow, "id" | "created_at">;
        Update: Partial<WaitlistRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
