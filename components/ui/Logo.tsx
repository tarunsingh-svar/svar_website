import { useId } from "react";
import { cn } from "@/lib/cn";

/** App-icon mark: waveform S on a blue squircle. */
function SvarMark({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const fillId = `${uid}-fill`;
  const clipId = `${uid}-clip`;

  return (
    <svg
      viewBox="0 0 272 272"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id={fillId} cx="42.5%" cy="40%" r="105%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="55%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </radialGradient>
        <clipPath id={clipId}>
          <rect width="272" height="272" rx="92.48" ry="92.48" />
        </clipPath>
      </defs>
      <rect
        width="272"
        height="272"
        rx="92.48"
        ry="92.48"
        fill={`url(#${fillId})`}
      />
      <g fill="#fff" clipPath={`url(#${clipId})`}>
        <rect x="68.350" y="96.000" width="5.3" height="15.000" rx="2.650" />
        <rect x="68.350" y="169.000" width="5.3" height="11.000" rx="2.650" />
        <rect x="79.350" y="89.000" width="5.3" height="33.000" rx="2.650" />
        <rect x="79.350" y="163.000" width="5.3" height="24.000" rx="2.650" />
        <rect x="90.350" y="76.000" width="5.3" height="58.000" rx="2.650" />
        <rect x="90.350" y="169.000" width="5.3" height="30.000" rx="2.650" />
        <rect x="100.850" y="67.000" width="5.3" height="74.000" rx="2.650" />
        <rect x="100.850" y="163.000" width="5.3" height="42.000" rx="2.650" />
        <rect x="111.350" y="61.000" width="5.3" height="84.000" rx="2.650" />
        <rect x="111.350" y="173.000" width="5.3" height="37.000" rx="2.650" />
        <rect x="122.350" y="55.000" width="5.3" height="31.000" rx="2.650" />
        <rect x="122.350" y="112.000" width="5.3" height="38.000" rx="2.650" />
        <rect x="122.350" y="185.000" width="5.3" height="31.000" rx="2.650" />
        <rect x="132.850" y="48.000" width="5.3" height="35.000" rx="2.650" />
        <rect x="132.850" y="116.000" width="5.3" height="39.000" rx="2.650" />
        <rect x="132.850" y="188.000" width="5.3" height="35.000" rx="2.650" />
        <rect x="143.350" y="55.000" width="5.3" height="31.000" rx="2.650" />
        <rect x="143.350" y="121.000" width="5.3" height="38.000" rx="2.650" />
        <rect x="143.350" y="185.000" width="5.3" height="31.000" rx="2.650" />
        <rect x="154.350" y="61.000" width="5.3" height="37.000" rx="2.650" />
        <rect x="154.350" y="126.000" width="5.3" height="84.000" rx="2.650" />
        <rect x="165.350" y="66.000" width="5.3" height="42.000" rx="2.650" />
        <rect x="165.350" y="130.000" width="5.3" height="75.000" rx="2.650" />
        <rect x="175.350" y="72.000" width="5.3" height="30.000" rx="2.650" />
        <rect x="175.350" y="137.000" width="5.3" height="60.000" rx="2.650" />
        <rect x="186.350" y="84.000" width="5.3" height="24.000" rx="2.650" />
        <rect x="186.350" y="149.000" width="5.3" height="37.000" rx="2.650" />
        <rect x="197.350" y="92.000" width="5.3" height="11.000" rx="2.650" />
        <rect x="197.350" y="160.000" width="5.3" height="17.000" rx="2.650" />
      </g>
    </svg>
  );
}

/** Wordmark: app-icon mark + SVAR AI. */
export function Logo({
  dark = false,
  className,
}: {
  dark?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <SvarMark className="h-8 w-8 shrink-0" />
      <span
        className={cn(
          "font-display text-lg font-bold tracking-tight",
          dark ? "text-white" : "text-ink"
        )}
      >
        SVAR{" "}
        <span className={dark ? "text-blue-300" : "text-primary"}>AI</span>
      </span>
    </span>
  );
}
