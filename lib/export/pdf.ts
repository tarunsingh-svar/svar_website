"use client";

import type { Note } from "@/lib/queries/notes";
import { formatFullDate, formatDuration } from "@/lib/format";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Minimal markdown to HTML for print output. Covers the subset the rewrite
 * templates emit: headings, bullets, task lists and bold runs.
 */
function markdownToHtml(markdown: string): string {
  const lines = escapeHtml(markdown).split("\n");
  const html: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      closeList();
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      closeList();
      const level = Math.min(heading[1].length + 1, 5);
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    const task = /^[-*]\s+\[([ xX])\]\s+(.*)$/.exec(line);
    if (task) {
      if (!inList) {
        html.push('<ul class="tasks">');
        inList = true;
      }
      const mark = task[1].toLowerCase() === "x" ? "☑" : "☐";
      html.push(`<li><span class="mark">${mark}</span>${inline(task[2])}</li>`);
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${inline(line)}</p>`);
  }

  closeList();
  return html.join("\n");
}

function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|\W)\*(?!\s)(.+?)(?<!\s)\*/g, "$1<em>$2</em>");
}

/**
 * Renders the note into a hidden iframe and opens the browser print dialog,
 * where the user can save as PDF. Avoids shipping a PDF engine to the client.
 */
export function exportNoteToPdf(note: Note) {
  const title = note.title?.trim() || "Untitled Note";
  const body = note.summary_text?.trim() ?? "";
  const transcript = note.transcribe_text?.trim() ?? "";

  const meta = [formatFullDate(note.created_at)];
  if (note.duration_seconds > 0) {
    meta.push(formatDuration(note.duration_seconds));
  }
  if (note.tags?.length) meta.push(note.tags.join(", "));

  const document_ = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page { margin: 20mm; }
      * { box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #2c2c2c;
        line-height: 1.6;
        margin: 0;
      }
      h1 { font-size: 24px; margin: 0 0 6px; letter-spacing: -0.02em; }
      h2 { font-size: 17px; margin: 22px 0 6px; }
      h3 { font-size: 15px; margin: 18px 0 4px; }
      h4, h5 { font-size: 14px; margin: 14px 0 4px; }
      p { margin: 0 0 10px; font-size: 14px; }
      ul { margin: 0 0 12px; padding-left: 20px; }
      ul.tasks { list-style: none; padding-left: 2px; }
      ul.tasks .mark { margin-right: 8px; }
      li { font-size: 14px; margin-bottom: 4px; }
      .meta { color: #6b7280; font-size: 12px; margin-bottom: 24px; }
      .divider { border: none; border-top: 1px solid #e0e0e0; margin: 28px 0 20px; }
      .section-label {
        text-transform: uppercase; letter-spacing: 0.08em;
        font-size: 10px; font-weight: 700; color: #9ca3af; margin-bottom: 8px;
      }
      .transcript { white-space: pre-wrap; font-size: 13px; color: #424242; }
      .footer { margin-top: 32px; font-size: 10px; color: #9ca3af; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <p class="meta">${escapeHtml(meta.join("  ·  "))}</p>
    ${body ? markdownToHtml(body) : "<p><em>No notes.</em></p>"}
    ${
      transcript
        ? `<hr class="divider" /><p class="section-label">Transcript</p><div class="transcript">${escapeHtml(
            transcript
          )}</div>`
        : ""
    }
    <p class="footer">Exported from SVAR AI</p>
  </body>
</html>`;

  const frame = window.document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";

  frame.onload = () => {
    const view = frame.contentWindow;
    if (!view) return;
    view.focus();
    view.print();
    // Safari fires print synchronously; give other browsers time to open the
    // dialog before tearing the frame down.
    window.setTimeout(() => frame.remove(), 1000);
  };

  window.document.body.appendChild(frame);
  frame.srcdoc = document_;
}
