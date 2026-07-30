"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mic, Pause, Play, Square, X } from "lucide-react";
import { useSession } from "@/components/app/SessionProvider";
import { usePaywall } from "@/lib/stores/paywall";
import {
  canCreateNote,
  FREE_MAX_RECORDING_SECONDS,
  FREE_NOTE_LIMIT,
  isPro,
  maxRecordingSeconds,
} from "@/lib/plan";
import { useRecorder, type RecordingResult } from "@/lib/hooks/useRecorder";
import { isRecordingSupported } from "@/lib/audio/mime";
import { uploadNoteAudio } from "@/lib/queries/audio";
import { useCreateNote } from "@/lib/queries/notes";
import { transcribeAudio } from "@/lib/queries/transcription";
import { formatDuration } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { AppPageHeader } from "@/components/app/AppShell";
import { LiveWaveform } from "@/components/app/record/LiveWaveform";
import { cn } from "@/lib/cn";

type Phase = "setup" | "recording" | "processing";

const PROCESSING_STEPS = [
  "Uploading your recording",
  "Transcribing",
  "Writing a summary",
] as const;

/** Capability detection never changes within a session. */
const subscribeToNothing = () => () => {};

export function RecordPage() {
  const router = useRouter();
  const { user, plan } = useSession();
  const showPaywall = usePaywall((state) => state.showPaywall);
  const createNote = useCreateNote();

  const [phase, setPhase] = useState<Phase>("setup");
  const [step, setStep] = useState(0);
  const stoppingRef = useRef(false);

  const limit = maxRecordingSeconds(plan);

  // Assume supported while rendering on the server, then correct on the client
  // once the browser APIs can actually be probed.
  const supported = useSyncExternalStore(
    subscribeToNothing,
    isRecordingSupported,
    () => true
  );

  const handleMaxReached = useCallback(() => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    toast.info(
      `Free recordings stop at ${FREE_MAX_RECORDING_SECONDS / 60} minutes.`
    );
    void finish();
    // finish is stable enough for this guarded one-shot call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recorder = useRecorder({
    maxSeconds: limit,
    onMaxReached: handleMaxReached,
  });

  useEffect(() => {
    if (recorder.error) toast.error(recorder.error);
  }, [recorder.error]);

  // Recording is lost if the page unloads, so make that explicit.
  useEffect(() => {
    if (phase !== "recording") return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase]);

  async function begin() {
    if (!canCreateNote(plan)) {
      showPaywall(
        `You've reached the free limit of ${FREE_NOTE_LIMIT} notes. Upgrade to Pro for unlimited notes.`
      );
      return;
    }
    stoppingRef.current = false;
    await recorder.start();
    setPhase("recording");
  }

  async function finish() {
    const result = await recorder.stop();
    if (!result || result.blob.size === 0) {
      toast.error("That recording came out empty. Please try again.");
      setPhase("setup");
      stoppingRef.current = false;
      return;
    }
    await process(result);
  }

  async function process(result: RecordingResult) {
    setPhase("processing");
    setStep(0);

    try {
      const audioPath = await uploadNoteAudio(
        user.id,
        result.blob,
        result.extension
      );

      setStep(1);
      const transcript = await transcribeAudio({
        audioPath,
        durationSeconds: result.durationSeconds,
      });

      setStep(2);
      const note = await createNote.mutateAsync({
        title: "Untitled Note",
        transcript,
        durationSeconds: result.durationSeconds,
        audioPath,
      });

      router.replace(`/app/notes/${note.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      toast.error(message);
      setPhase("setup");
      stoppingRef.current = false;
    }
  }

  function discard() {
    recorder.cancel();
    setPhase("setup");
    stoppingRef.current = false;
  }

  const nearLimit =
    Number.isFinite(limit) && recorder.elapsed > limit - 30 && limit > 0;

  return (
    <>
      <AppPageHeader
        title="Record"
        description={
          isPro(plan)
            ? "Record for as long as you need."
            : `Free plan: up to ${FREE_MAX_RECORDING_SECONDS / 60} minutes per recording.`
        }
      />

      <div className="mx-auto max-w-2xl px-5 py-10 md:px-8 md:py-16">
        {!supported ? (
          <UnsupportedNotice />
        ) : phase === "processing" ? (
          <Processing step={step} />
        ) : (
          <div className="rounded-3xl border border-hairline bg-white p-8 text-center md:p-12">
            <p
              className={cn(
                "font-display text-5xl font-bold tabular-nums tracking-tight transition-colors md:text-6xl",
                nearLimit ? "text-amber-600" : "text-ink"
              )}
            >
              {formatDuration(recorder.elapsed)}
            </p>
            {Number.isFinite(limit) && (
              <p className="mt-2 text-sm text-faint">
                of {formatDuration(limit)}
              </p>
            )}

            <LiveWaveform
              levels={recorder.levels}
              active={recorder.state === "recording"}
              className="my-8"
            />

            {phase === "setup" ? (
              <>
                <button
                  onClick={() => void begin()}
                  className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary text-white shadow-[0_12px_32px_-8px_rgba(37,99,235,0.6)] transition-transform hover:scale-105 active:scale-95"
                  aria-label="Start recording"
                >
                  <Mic className="size-8" />
                </button>
                <p className="mt-5 text-[15px] text-muted">
                  Tap to start. We&apos;ll transcribe it the moment you stop.
                </p>
              </>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={discard}
                  className="flex size-12 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:bg-surface hover:text-ink"
                  aria-label="Discard recording"
                >
                  <X className="size-5" />
                </button>

                <button
                  onClick={() =>
                    recorder.state === "paused"
                      ? recorder.resume()
                      : recorder.pause()
                  }
                  className="flex size-16 items-center justify-center rounded-full border-2 border-primary text-primary transition-colors hover:bg-blue-50"
                  aria-label={
                    recorder.state === "paused"
                      ? "Resume recording"
                      : "Pause recording"
                  }
                >
                  {recorder.state === "paused" ? (
                    <Play className="size-6 translate-x-0.5 fill-current" />
                  ) : (
                    <Pause className="size-6 fill-current" />
                  )}
                </button>

                <button
                  onClick={() => void finish()}
                  className="flex size-12 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-bright"
                  aria-label="Stop and transcribe"
                >
                  <Square className="size-4 fill-current" />
                </button>
              </div>
            )}
          </div>
        )}

        {phase === "setup" && supported && (
          <p className="mt-6 text-center text-sm leading-relaxed text-faint">
            Keep this tab open while recording — browsers pause microphone
            capture in background tabs.
          </p>
        )}
      </div>
    </>
  );
}

function Processing({ step }: { step: number }) {
  return (
    <div className="rounded-3xl border border-hairline bg-white p-8 md:p-12">
      <div className="mx-auto mb-8 flex size-14 items-center justify-center rounded-2xl bg-blue-50">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
      <ol className="mx-auto max-w-xs space-y-4">
        {PROCESSING_STEPS.map((label, index) => (
          <li key={label} className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                index < step && "border-primary bg-primary text-white",
                index === step && "border-primary text-primary",
                index > step && "border-hairline text-faint"
              )}
            >
              {index < step ? "✓" : index + 1}
            </span>
            <span
              className={cn(
                "text-[15px]",
                index <= step ? "font-semibold text-ink" : "text-faint"
              )}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-center text-sm leading-relaxed text-muted">
        This usually takes under a minute. Longer recordings take longer, and the
        AI service may need a moment to wake up.
      </p>
    </div>
  );
}

function UnsupportedNotice() {
  return (
    <div className="rounded-3xl border border-hairline bg-white p-8 text-center md:p-12">
      <p className="font-display text-lg font-semibold text-ink">
        Recording isn&apos;t available in this browser
      </p>
      <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-muted">
        SVAR needs microphone access over a secure connection. Try the latest
        Chrome, Safari, Edge or Firefox — or record on the mobile app and your
        notes will show up here.
      </p>
      <Button href="/app" variant="secondary" className="mt-6">
        Back to notes
      </Button>
    </div>
  );
}
