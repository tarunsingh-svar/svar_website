"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

const TAGS = [
  { id: "all", label: "All" },
  { id: "work", label: "#work" },
  { id: "ideas", label: "#ideas" },
  { id: "learning", label: "#learning" },
] as const;

const NOTES: { title: string; meta: string; tag: string }[] = [
  { title: "Onboarding kickoff", meta: "24 min · 4 outputs", tag: "work" },
  { title: "App idea — trail buddy", meta: "3 min · voice memo", tag: "ideas" },
  { title: "ML lecture — week 4", meta: "52 min · notes ready", tag: "learning" },
  { title: "Client call — Acme", meta: "31 min · email sent", tag: "work" },
  { title: "Morning brain dump", meta: "6 min · journaled", tag: "ideas" },
  { title: "Standup — Tuesday", meta: "9 min · summary", tag: "work" },
];

/** Filterable notes grid — demonstrates tags + search organization. */
export function OrganizeBoard({ className }: { className?: string }) {
  const [filter, setFilter] = useState<string>("all");
  const reduceMotion = useReducedMotion();
  const visible = NOTES.filter((n) => filter === "all" || n.tag === filter);

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {TAGS.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors",
              filter === t.id
                ? "border-primary bg-primary text-white"
                : "border-hairline bg-white text-muted hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {visible.map((n) => (
          <motion.div
            key={n.title}
            layout={!reduceMotion}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-hairline bg-white p-3"
          >
            <p className="truncate text-[13px] font-semibold text-ink">
              {n.title}
            </p>
            <p className="mt-0.5 text-[11px] text-faint">{n.meta}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
