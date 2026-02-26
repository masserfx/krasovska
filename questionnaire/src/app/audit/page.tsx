"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Shield,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  HelpCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Fingerprint,
} from "lucide-react";
import { fetchAuditLog } from "@/lib/api";
import { AuditEntry } from "@/lib/audit";
import { SECTIONS } from "@/types";
import AppHeader from "@/components/AppHeader";

const SECTION_LABELS: Record<string, string> = {};
for (const s of SECTIONS) {
  SECTION_LABELS[s.id] = s.title;
}

const SECTION_COLORS: Record<string, string> = {
  organizace: "bg-blue-100 text-blue-800",
  personal: "bg-purple-100 text-purple-800",
  finance: "bg-green-100 text-green-800",
  sportoviste: "bg-orange-100 text-orange-800",
  rezervace: "bg-cyan-100 text-cyan-800",
  clenstvi: "bg-pink-100 text-pink-800",
  aktivity: "bg-yellow-100 text-yellow-800",
  turnaje: "bg-red-100 text-red-800",
  eshop: "bg-indigo-100 text-indigo-800",
  restaurace: "bg-amber-100 text-amber-800",
  marketing: "bg-teal-100 text-teal-800",
  it: "bg-slate-100 text-slate-800",
  legislativa: "bg-violet-100 text-violet-800",
  cile: "bg-emerald-100 text-emerald-800",
};

function DeviceIcon({ type }: { type: string | null }) {
  switch (type) {
    case "mobile":
      return <Smartphone className="h-4 w-4" />;
    case "tablet":
      return <Tablet className="h-4 w-4" />;
    case "desktop":
      return <Monitor className="h-4 w-4" />;
    default:
      return <HelpCircle className="h-4 w-4" />;
  }
}

function GeoDisplay({ entry }: { entry: AuditEntry }) {
  if (entry.geo_status === "resolved" && entry.city && entry.country) {
    return (
      <span className="flex items-center gap-1">
        <Globe className="h-3.5 w-3.5 text-muted" />
        {entry.city}, {entry.country}
      </span>
    );
  }
  if (entry.geo_status === "pending") {
    return <span className="text-muted text-xs italic">čeká…</span>;
  }
  if (entry.geo_status === "skipped") {
    return <span className="text-muted text-xs">localhost</span>;
  }
  return <span className="text-muted text-xs">—</span>;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "právě teď";
  if (diffMin < 60) return `před ${diffMin} min`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `před ${diffHours} h`;

  return d.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PAGE_SIZE = 30;

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async (offset: number) => {
    const data = await fetchAuditLog({ limit: PAGE_SIZE, offset });
    if (data.length < PAGE_SIZE) setHasMore(false);
    return data;
  }, []);

  useEffect(() => {
    load(0)
      .then((data) => setEntries(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [load]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const data = await load(entries.length);
      setEntries((prev) => [...prev, ...data]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
    <AppHeader activeTab="audit" />
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted">
            Přehled všech editací dotazníku
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-lg border border-border bg-white p-12 text-center">
          <Shield className="mx-auto mb-3 h-10 w-10 text-muted/40" />
          <p className="text-muted">Zatím žádné záznamy</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="px-4 py-3 text-left font-medium text-muted">
                    <Clock className="mr-1 inline h-3.5 w-3.5" />
                    Čas
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted">
                    Dotazník
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted">
                    IP
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted">
                    Lokace
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted">
                    Zařízení
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted">
                    Změněné sekce
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isExpanded = expandedId === entry.id;
                  const di = entry.device_info;
                  return (
                    <>
                      <tr
                        key={entry.id}
                        className="border-b border-border last:border-0 hover:bg-gray-50/50 cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-muted">
                          <span className="flex items-center gap-1">
                            {di ? (
                              isExpanded ? (
                                <ChevronDown className="h-3.5 w-3.5 text-muted/60" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-muted/60" />
                              )
                            ) : (
                              <span className="inline-block w-3.5" />
                            )}
                            {formatTime(entry.created_at)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {entry.questionnaire_title || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted">
                          {entry.ip_address || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted">
                          <GeoDisplay entry={entry} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="flex items-center gap-1.5 text-muted">
                            <DeviceIcon type={entry.device_type} />
                            <span className="text-xs capitalize">
                              {entry.device_type || "?"}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(entry.changed_sections || []).map((sec) => (
                              <span
                                key={sec}
                                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                  SECTION_COLORS[sec] || "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {SECTION_LABELS[sec] || sec}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && di && (
                        <tr key={`${entry.id}-detail`} className="border-b border-border bg-gray-50/80">
                          <td colSpan={6} className="px-4 py-3">
                            <div className="flex items-start gap-2">
                              <Fingerprint className="mt-0.5 h-4 w-4 text-primary/60" />
                              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs sm:grid-cols-3 md:grid-cols-4">
                                <div>
                                  <span className="text-muted">Obrazovka: </span>
                                  <span className="font-medium">{di.screen}</span>
                                </div>
                                <div>
                                  <span className="text-muted">Viewport: </span>
                                  <span className="font-medium">{di.viewport}</span>
                                </div>
                                <div>
                                  <span className="text-muted">Platforma: </span>
                                  <span className="font-medium">{di.platform}</span>
                                </div>
                                <div>
                                  <span className="text-muted">Jazyk: </span>
                                  <span className="font-medium">{di.language}</span>
                                </div>
                                <div>
                                  <span className="text-muted">Timezone: </span>
                                  <span className="font-medium">{di.timezone}</span>
                                </div>
                                <div>
                                  <span className="text-muted">Barvy: </span>
                                  <span className="font-medium">{di.colorDepth}-bit</span>
                                </div>
                                <div>
                                  <span className="text-muted">Touch: </span>
                                  <span className="font-medium">{di.touchPoints} bodů</span>
                                </div>
                                {di.connection && (
                                  <div>
                                    <span className="text-muted">Spojení: </span>
                                    <span className="font-medium">{di.connection}</span>
                                  </div>
                                )}
                                <div className="col-span-2 sm:col-span-3 md:col-span-4">
                                  <span className="text-muted">Device ID: </span>
                                  <span className="font-mono font-medium">{di.deviceId}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="mt-4 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-gray-50 disabled:opacity-50"
              >
                {loadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                Načíst další
              </button>
            </div>
          )}
        </>
      )}
    </div>
    </div>
  );
}
