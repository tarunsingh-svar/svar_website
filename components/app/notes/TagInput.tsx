"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export function TagInput({
  value,
  onChange,
  suggestions = [],
  className,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  className?: string;
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const tag = raw.trim();
    if (!tag || value.includes(tag)) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  };

  const remove = (tag: string) =>
    onChange(value.filter((entry) => entry !== tag));

  const unusedSuggestions = suggestions.filter((tag) => !value.includes(tag));

  return (
    <div className={className}>
      <div
        className={cn(
          "flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-hairline bg-white px-2.5 py-2",
          "focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-blue-50 py-1 pl-2.5 pr-1 text-sm font-medium text-primary-deep"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="rounded-full p-0.5 transition-colors hover:bg-blue-100"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              add(draft);
            } else if (
              event.key === "Backspace" &&
              !draft &&
              value.length > 0
            ) {
              remove(value[value.length - 1]);
            }
          }}
          onBlur={() => add(draft)}
          placeholder={value.length === 0 ? "Add a tag and press Enter" : ""}
          className="min-w-32 flex-1 bg-transparent py-1 text-[15px] text-ink outline-none placeholder:text-faint"
          aria-label="Add a tag"
        />
      </div>

      {unusedSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {unusedSuggestions.slice(0, 8).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => add(tag)}
              className="rounded-full border border-hairline px-2.5 py-0.5 text-xs font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary"
            >
              + {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
