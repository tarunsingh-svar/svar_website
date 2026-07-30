"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { pickRecordingFormat, type RecordingFormat } from "@/lib/audio/mime";

export type RecorderState = "idle" | "recording" | "paused" | "stopped";

export interface RecordingResult {
  blob: Blob;
  extension: string;
  durationSeconds: number;
}

const LEVEL_BINS = 48;

/**
 * Wraps MediaRecorder with the pieces the UI needs: elapsed time that ignores
 * paused stretches, a rolling level meter for the waveform, and a wake lock so
 * a backgrounded tab is less likely to be throttled mid-recording.
 */
export function useRecorder({
  maxSeconds,
  onMaxReached,
}: {
  maxSeconds: number;
  onMaxReached?: () => void;
}) {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [levels, setLevels] = useState<number[]>(() =>
    new Array(LEVEL_BINS).fill(0)
  );
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const formatRef = useRef<RecordingFormat | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const frameRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Elapsed time is derived from timestamps rather than a tick counter so
  // throttled timers in a background tab can't undercount the duration.
  const startedAtRef = useRef(0);
  const accumulatedRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxSecondsRef = useRef(maxSeconds);
  const onMaxReachedRef = useRef(onMaxReached);

  useEffect(() => {
    maxSecondsRef.current = maxSeconds;
    onMaxReachedRef.current = onMaxReached;
  }, [maxSeconds, onMaxReached]);

  const currentElapsed = useCallback(() => {
    const live =
      startedAtRef.current > 0 ? (Date.now() - startedAtRef.current) / 1000 : 0;
    return accumulatedRef.current + live;
  }, []);

  const releaseWakeLock = useCallback(() => {
    void wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
  }, []);

  const teardown = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    analyserRef.current = null;
    releaseWakeLock();
  }, [releaseWakeLock]);

  useEffect(() => teardown, [teardown]);

  const startMetering = useCallback(() => {
    function loop() {
      const analyser = analyserRef.current;
      if (!analyser) return;

      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteTimeDomainData(data);

      let sumSquares = 0;
      for (const sample of data) {
        const centred = (sample - 128) / 128;
        sumSquares += centred * centred;
      }
      const rms = Math.sqrt(sumSquares / data.length);
      // Scale up: speech at normal volume sits around 0.05–0.2 RMS.
      const level = Math.min(1, rms * 3.2);

      setLevels((previous) => [...previous.slice(1), level]);
      frameRef.current = requestAnimationFrame(loop);
    }

    frameRef.current = requestAnimationFrame(loop);
  }, []);

  const startTicking = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      const value = currentElapsed();
      setElapsed(value);
      if (Number.isFinite(maxSecondsRef.current) && value >= maxSecondsRef.current) {
        onMaxReachedRef.current?.();
      }
    }, 200);
  }, [currentElapsed]);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const format = pickRecordingFormat();
      formatRef.current = format;

      const recorder = new MediaRecorder(
        stream,
        format?.mimeType ? { mimeType: format.mimeType } : undefined
      );
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorderRef.current = recorder;
      // Timeslice so a crashed tab still leaves usable chunks behind.
      recorder.start(1000);

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      startMetering();

      try {
        wakeLockRef.current = await navigator.wakeLock?.request("screen");
      } catch {
        // Wake lock is best-effort and unavailable in some browsers.
      }

      accumulatedRef.current = 0;
      startedAtRef.current = Date.now();
      setElapsed(0);
      setState("recording");
      startTicking();
    } catch (cause) {
      const name = (cause as Error)?.name;
      setError(
        name === "NotAllowedError"
          ? "Microphone access was blocked. Allow it in your browser settings and try again."
          : name === "NotFoundError"
            ? "No microphone was found. Connect one and try again."
            : "Couldn't start recording. Please try again."
      );
      teardown();
    }
  }, [startMetering, startTicking, teardown]);

  const pause = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    recorder.pause();
    accumulatedRef.current = currentElapsed();
    startedAtRef.current = 0;
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    setState("paused");
  }, [currentElapsed]);

  const resume = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "paused") return;
    recorder.resume();
    startedAtRef.current = Date.now();
    setState("recording");
    startTicking();
  }, [startTicking]);

  const stop = useCallback((): Promise<RecordingResult | null> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return Promise.resolve(null);
    }

    const durationSeconds = Math.round(currentElapsed());

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const format = formatRef.current;
        const type = recorder.mimeType || format?.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        recorderRef.current = null;
        startedAtRef.current = 0;
        accumulatedRef.current = 0;
        teardown();
        setState("stopped");
        resolve({
          blob,
          extension: format?.extension ?? "webm",
          durationSeconds,
        });
      };
      recorder.stop();
    });
  }, [currentElapsed, teardown]);

  const cancel = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    chunksRef.current = [];
    recorderRef.current = null;
    startedAtRef.current = 0;
    accumulatedRef.current = 0;
    teardown();
    setElapsed(0);
    setLevels(new Array(LEVEL_BINS).fill(0));
    setState("idle");
  }, [teardown]);

  return { state, elapsed, levels, error, start, pause, resume, stop, cancel };
}
