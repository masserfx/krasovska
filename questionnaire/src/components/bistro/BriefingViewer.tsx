"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";

export default function BriefingViewer() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/docs/CEO_BRIEFING.md")
      .then((r) => r.text())
      .then((text) => setContent(text))
      .catch(() => setContent("Chyba při načítání CEO Briefingu."))
      .finally(() => setLoading(false));
  }, []);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex gap-3">
        <button
          onClick={handlePrint}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Tisk
        </button>
      </div>

      <article className="mx-auto max-w-4xl">
        <div
          className="
            prose-headings:text-foreground prose-headings:font-bold
            prose-h1:mb-4 prose-h1:text-2xl prose-h1:border-b prose-h1:border-border prose-h1:pb-3
            prose-h2:mb-3 prose-h2:mt-8 prose-h2:text-xl
            prose-h3:mb-2 prose-h3:mt-6 prose-h3:text-lg
            prose-p:mb-4 prose-p:leading-relaxed prose-p:text-foreground/90
            prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80
            prose-strong:text-foreground
            prose-ul:mb-4 prose-ul:list-disc prose-ul:pl-6
            prose-ol:mb-4 prose-ol:list-decimal prose-ol:pl-6
            prose-li:mb-1 prose-li:text-foreground/90
            prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted
            prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-foreground
            prose-pre:rounded-lg prose-pre:bg-gray-900 prose-pre:p-4
            prose-pre:prose-code:bg-transparent prose-pre:prose-code:text-gray-100
            prose-hr:my-8 prose-hr:border-border
          "
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ children }) => (
                <div className="mb-6 overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="border-b border-border bg-gray-50">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border-t border-border px-4 py-2.5 text-foreground/90">
                  {children}
                </td>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-gray-50/50">{children}</tr>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
