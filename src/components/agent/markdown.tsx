"use client";

import { createCodePlugin } from "@streamdown/code";
import { Streamdown, type Components } from "streamdown";
import { cn } from "@/lib/utils";

const codePlugin = createCodePlugin({
  themes: ["github-dark", "github-dark"],
});

const components: Components = {
  a: ({ className, ...props }) => (
    <a
      className={cn("font-medium text-primary underline-offset-4 hover:underline", className)}
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote className={cn("border-l border-line pl-3 text-ink-muted", className)} {...props} />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn("rounded bg-base-300 px-1.5 py-0.5 font-mono text-[0.78em] text-ink", className)}
      {...props}
    />
  ),
  h1: ({ className, ...props }) => (
    <h1 className={cn("mt-5 text-xl font-semibold leading-tight text-ink first:mt-0", className)} {...props} />
  ),
  h2: ({ className, ...props }) => (
    <h2 className={cn("mt-5 text-lg font-semibold leading-tight text-ink first:mt-0", className)} {...props} />
  ),
  h3: ({ className, ...props }) => (
    <h3 className={cn("mt-4 text-base font-semibold leading-tight text-ink first:mt-0", className)} {...props} />
  ),
  hr: ({ className, ...props }) => <hr className={cn("my-5 border-line", className)} {...props} />,
  inlineCode: ({ className, ...props }) => (
    <code
      className={cn("rounded bg-base-300 px-1.5 py-0.5 font-mono text-[0.78em] text-ink", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }) => <li className={cn("pl-1 leading-6", className)} {...props} />,
  ol: ({ className, ...props }) => (
    <ol className={cn("my-3 list-decimal space-y-1 pl-5 marker:text-ink-faint", className)} {...props} />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("my-3 leading-6 text-ink first:mt-0 last:mb-0", className)} {...props} />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "my-4 overflow-x-auto rounded-box border border-line bg-base-100 p-3 text-xs leading-5 text-ink",
        className
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }) => (
    <div className="my-4 overflow-x-auto rounded-box border border-line bg-base-100">
      <table className={cn("w-full min-w-max border-collapse text-left text-sm", className)} {...props} />
    </div>
  ),
  tbody: ({ className, ...props }) => <tbody className={cn("divide-y divide-line/60", className)} {...props} />,
  td: ({ className, ...props }) => (
    <td className={cn("px-3 py-2 align-top text-ink-muted tabular-nums", className)} {...props} />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "border-b border-line bg-base-200 px-3 py-2 text-[0.6875rem] font-medium uppercase tracking-wider text-ink-faint",
        className
      )}
      {...props}
    />
  ),
  thead: ({ className, ...props }) => <thead className={cn("text-ink-faint", className)} {...props} />,
  ul: ({ className, ...props }) => (
    <ul className={cn("my-3 list-disc space-y-1 pl-5 marker:text-ink-faint", className)} {...props} />
  ),
};

export function Markdown({ children, streaming }: { children: string; streaming?: boolean }) {
  return (
    <Streamdown
      animated={streaming ? { animation: "fadeIn", duration: 120, sep: "word", stagger: 12 } : false}
      caret={streaming ? "block" : undefined}
      className="text-md text-ink"
      components={components}
      controls={{ code: { copy: true }, table: { copy: true, download: true } }}
      lineNumbers={false}
      mode={streaming ? "streaming" : "static"}
      plugins={{ code: codePlugin }}
      skipHtml
    >
      {children}
    </Streamdown>
  );
}
