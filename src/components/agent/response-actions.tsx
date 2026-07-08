"use client";

import { Check, Copy, Download, FileText } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ResponseActions({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const cleanText = text.trim();

  if (!cleanText) return null;

  async function copyText() {
    try {
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-4 flex items-center gap-1.5 text-ink-faint">
      <div className="relative">
        <ActionButton
          active={open}
          label="Download response"
          onClick={() => setOpen((value) => !value)}
        >
          <Download className="h-4 w-4" />
        </ActionButton>

        {open ? (
          <div className="absolute left-0 top-10 z-30 w-48 rounded-box border border-line bg-base-200 p-1.5 shadow-linear-lg">
            <MenuButton
              label="PDF"
              onClick={() => {
                setOpen(false);
                downloadPdf(cleanText);
              }}
            >
              <FileText className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              label="Markdown"
              onClick={() => {
                setOpen(false);
                downloadMarkdown(cleanText);
              }}
            >
              <FileText className="h-4 w-4" />
            </MenuButton>
          </div>
        ) : null}
      </div>

      <ActionButton label={copied ? "Copied" : "Copy response text"} onClick={copyText}>
        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      </ActionButton>
    </div>
  );
}

function ActionButton({
  active,
  children,
  label,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-base-300 hover:text-ink",
        active && "bg-base-300 text-ink"
      )}
    >
      {children}
    </button>
  );
}

function MenuButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-field px-2.5 py-2 text-left text-sm text-ink-muted transition-colors hover:bg-base-300 hover:text-ink"
    >
      {children}
      {label}
    </button>
  );
}

function downloadMarkdown(text: string) {
  downloadBlob(new Blob([text], { type: "text/markdown;charset=utf-8" }), `sway-response-${timestamp()}.md`);
}

function downloadPdf(text: string) {
  downloadBlob(createTextPdf(text), `sway-response-${timestamp()}.pdf`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function createTextPdf(text: string) {
  const marginX = 48;
  const startY = 760;
  const lineHeight = 14;
  const linesPerPage = 50;
  const lines = wrapPdfText(text, 92);
  const pages = chunk(lines.length ? lines : [""], linesPerPage);
  const objects: string[] = [];

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  const pageObjectIds = pages.map((_, index) => 3 + index * 2);
  objects.push(`<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`);

  pages.forEach((pageLines, index) => {
    const pageId = 3 + index * 2;
    const contentId = pageId + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentId} 0 R >>`);
    const stream = [
      "BT",
      "/F1 11 Tf",
      `${marginX} ${startY} Td`,
      `${lineHeight} TL`,
      ...pageLines.map((line) => `(${escapePdfText(line)}) Tj T*`),
      "ET",
    ].join("\n");
    objects.push(`<< /Length ${byteLength(stream)} >>\nstream\n${stream}\nendstream`);
  });

  const header = "%PDF-1.4\n";
  let body = "";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(byteLength(header + body));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = byteLength(header + body);
  const xref = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF",
  ].join("\n");

  return new Blob([header, body, xref], { type: "application/pdf" });
}

function wrapPdfText(text: string, maxLength: number) {
  return text.split(/\r?\n/).flatMap((line) => {
    if (!line.trim()) return [""];
    const words = line.split(/\s+/);
    const lines: string[] = [];
    let current = "";

    words.forEach((word) => {
      if (word.length > maxLength) {
        if (current) {
          lines.push(current);
          current = "";
        }
        for (let index = 0; index < word.length; index += maxLength) {
          lines.push(word.slice(index, index + maxLength));
        }
        return;
      }

      if (!current) {
        current = word;
      } else if (`${current} ${word}`.length <= maxLength) {
        current = `${current} ${word}`;
      } else {
        lines.push(current);
        current = word;
      }
    });

    if (current) lines.push(current);
    return lines;
  });
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function escapePdfText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function byteLength(text: string) {
  return new TextEncoder().encode(text).length;
}
