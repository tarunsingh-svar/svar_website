"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/cn";

/**
 * Renders rewrite output. Rewrites come back as markdown with headings,
 * bullets and task lists, so those three need to look right above all.
 */
export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4 text-[15px] leading-relaxed text-ink", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3 className="pt-2 font-display text-[17px] font-bold tracking-tight text-ink">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="pt-1 font-display text-[15px] font-bold text-ink">
              {children}
            </h4>
          ),
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          ul: ({ children }) => (
            <ul className="space-y-1.5 pl-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-1.5 pl-5">{children}</ol>
          ),
          li: ({ children, ...props }) => {
            const isTask = "checked" in props && props.checked !== null;
            return (
              <li
                className={cn(
                  "leading-relaxed",
                  isTask
                    ? "flex items-start gap-2 list-none"
                    : "list-disc marker:text-faint ml-4"
                )}
              >
                {children}
              </li>
            );
          },
          input: ({ checked }) => (
            <input
              type="checkbox"
              checked={checked ?? false}
              readOnly
              className="mt-1 size-4 shrink-0 rounded border-hairline accent-primary"
            />
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-ink">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/30 pl-4 italic text-muted">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[13px] text-ink">
              {children}
            </code>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-2 hover:text-primary-bright"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="border-hairline" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
