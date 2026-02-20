"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FileText,
  Briefcase,
  Settings,
  Wrench,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ─── Document definitions ─── */

interface DocDef {
  id: string;
  slug: string;
  title: string;
  category: "strategic" | "operational" | "technical";
}

const DOCS: DocDef[] = [
  { id: "ceo-briefing", slug: "CEO_BRIEFING.md", title: "CEO Briefing", category: "strategic" },
  { id: "bistro-strategie", slug: "BISTRO_STRATEGIE.md", title: "Strategie bistra", category: "strategic" },
  { id: "bistro-financni-model", slug: "BISTRO_FINANCNI_MODEL.md", title: "Finanční model", category: "strategic" },
  { id: "bistro-personal", slug: "BISTRO_PERSONAL.md", title: "Personální strategie", category: "strategic" },
  { id: "marketing-strategie", slug: "MARKETING_STRATEGIE.md", title: "Marketing", category: "strategic" },
  { id: "bistro-trhy", slug: "BISTRO_TRHY.md", title: "Analýza trhu", category: "strategic" },
  { id: "bistro-delivery", slug: "BISTRO_DELIVERY.md", title: "Delivery & Quick Wins", category: "strategic" },
  { id: "provozni-plan", slug: "provozni-plan-hala-krasovska-2026.md", title: "Provozní plán 2026", category: "operational" },
  { id: "architektura", slug: "ARCHITEKTURA_PLATFORMY.md", title: "Architektura platformy", category: "technical" },
  { id: "prd", slug: "PRD.md", title: "PRD — Specifikace", category: "technical" },
];

const CATEGORIES: { key: DocDef["category"]; label: string; icon: LucideIcon }[] = [
  { key: "strategic", label: "Strategické", icon: Briefcase },
  { key: "operational", label: "Provozní", icon: Wrench },
  { key: "technical", label: "Technické", icon: Settings },
];

/* ─── Component ─── */

export default function DocViewer() {
  const [activeDoc, setActiveDoc] = useState<DocDef>(DOCS[0]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/docs/${activeDoc.slug}`)
      .then((r) => r.text())
      .then((text) => setContent(text))
      .catch(() => setContent("Chyba při načítání dokumentu."))
      .finally(() => setLoading(false));
  }, [activeDoc]);

  function selectDoc(doc: DocDef) {
    setActiveDoc(doc);
    setSidebarOpen(false);
  }

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden">
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg md:hidden"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-30 w-72 bg-white pt-28 shadow-lg transition-transform md:static md:z-auto md:w-64 md:translate-x-0 md:pt-0 md:shadow-none lg:w-72`}
      >
        <div className="flex h-full flex-col overflow-y-auto border-r border-border p-4">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Dokumenty</h2>
          </div>

          {CATEGORIES.map((cat) => {
            const docs = DOCS.filter((d) => d.category === cat.key);
            const CatIcon = cat.icon;
            return (
              <div key={cat.key} className="mb-4">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                  <CatIcon className="h-3.5 w-3.5" />
                  {cat.label}
                </div>
                <ul className="space-y-0.5">
                  {docs.map((doc) => (
                    <li key={doc.id}>
                      <button
                        onClick={() => selectDoc(doc)}
                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          activeDoc.id === doc.id
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-foreground hover:bg-gray-100"
                        }`}
                      >
                        {doc.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Content area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted" />
          </div>
        ) : (
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
        )}
      </main>
    </div>
  );
}
