"use client";

import { useRef, useState } from "react";
import { Download, Pause, Play } from "lucide-react";
import { useAudioUrl } from "@/lib/queries/audio";
import { formatDuration } from "@/lib/format";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

export function AudioPlayer({
  path,
  durationSeconds,
  className,
}: {
  path: string;
  durationSeconds: number;
  className?: string;
}) {
  const { data: url, isLoading, error } = useAudioUrl(path);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(durationSeconds);

  // A re-signed URL swaps the audio source, so playback state has to restart.
  const [loadedUrl, setLoadedUrl] = useState(url);
  if (url !== loadedUrl) {
    setLoadedUrl(url);
    setPlaying(false);
    setPosition(0);
  }

  if (isLoading) return <Skeleton className={cn("h-16 rounded-2xl", className)} />;

  if (error || !url) {
    return (
      <p
        className={cn(
          "rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-muted",
          className
        )}
      >
        The recording for this note isn&apos;t available.
      </p>
    );
  }

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-hairline bg-white px-4 py-3",
        className
      )}
    >
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) =>
          setPosition(event.currentTarget.currentTime)
        }
        onLoadedMetadata={(event) => {
          const value = event.currentTarget.duration;
          // MediaRecorder blobs often report Infinity until fully buffered.
          if (Number.isFinite(value) && value > 0) setDuration(value);
        }}
        onEnded={() => {
          setPlaying(false);
          setPosition(0);
        }}
      />

      <button
        onClick={toggle}
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-bright"
        aria-label={playing ? "Pause recording" : "Play recording"}
      >
        {playing ? (
          <Pause className="size-5 fill-current" />
        ) : (
          <Play className="size-5 translate-x-0.5 fill-current" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={position}
          onChange={(event) => {
            const next = Number(event.target.value);
            setPosition(next);
            if (audioRef.current) audioRef.current.currentTime = next;
          }}
          aria-label="Seek"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-hairline accent-primary"
          style={{
            background: `linear-gradient(to right, var(--color-primary) ${progress}%, var(--color-hairline) ${progress}%)`,
          }}
        />
        <div className="mt-1.5 flex justify-between text-xs tabular-nums text-faint">
          <span>{formatDuration(position)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      <a
        href={url}
        download
        className="shrink-0 rounded-full p-2 text-faint transition-colors hover:bg-surface hover:text-ink"
        aria-label="Download recording"
      >
        <Download className="size-4" />
      </a>
    </div>
  );
}
