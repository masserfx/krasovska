"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2,
  Printer,
  CheckSquare,
  Square,
  QrCode,
  ArrowLeft,
  Download,
  Filter,
} from "lucide-react";
import QRCode from "qrcode";
import { Product, ProductCategory, PRODUCT_CATEGORY_LABELS } from "@/types/eshop";
import { fetchProducts } from "@/lib/eshop-api";
import { formatPrice } from "@/lib/eshop-utils";
import AppHeader from "@/components/AppHeader";

type LabelSize = "small" | "medium" | "large";

const LABEL_SIZES: Record<
  LabelSize,
  { label: string; cols: number; qrPx: number; mmW: number; mmH: number; desc: string }
> = {
  small: { label: "Malé", cols: 5, qrPx: 80, mmW: 38, mmH: 38, desc: "38×38 mm — regály" },
  medium: { label: "Střední", cols: 4, qrPx: 120, mmW: 50, mmH: 50, desc: "50×50 mm — standard" },
  large: { label: "Velké", cols: 3, qrPx: 160, mmW: 70, mmH: 70, desc: "70×70 mm — vitríny" },
};

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Všechny kategorie" },
  ...Object.entries(PRODUCT_CATEGORY_LABELS).map(([k, v]) => ({ value: k, label: v })),
];

interface LabelEntry {
  product: Product;
  index: number;
}

function QrPrintContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [labelSize, setLabelSize] = useState<LabelSize>("medium");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [exportingPdf, setExportingPdf] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = categoryFilter
    ? products.filter((p) => p.category === categoryFilter)
    : products;

  function toggleProduct(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    const ids = filteredProducts.map((p) => p.id);
    const allSelected = ids.every((id) => selected.has(id));
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => new Set([...prev, ...ids]));
    }
  }

  function getQuantity(id: string) {
    return quantities[id] ?? 1;
  }

  function setQuantity(id: string, val: number) {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, Math.min(99, val)) }));
  }

  async function generatePreview() {
    if (selected.size === 0) return;
    setGenerating(true);

    const size = LABEL_SIZES[labelSize];
    const baseUrl = window.location.origin;
    const urls: Record<string, string> = {};

    for (const id of selected) {
      try {
        const dataUrl = await QRCode.toDataURL(`${baseUrl}/eshop/s/${id}`, {
          width: size.qrPx * 2,
          margin: 1,
          errorCorrectionLevel: "M",
        });
        urls[id] = dataUrl;
      } catch {
        // skip
      }
    }

    setQrDataUrls(urls);
    setGenerating(false);
    setPreviewing(true);
  }

  function handlePrint() {
    window.print();
  }

  async function handlePdfExport() {
    if (!previewRef.current) return;
    setExportingPdf(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas-pro"),
      ]);
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const printW = pageW - margin * 2;
      const imgRatio = canvas.height / canvas.width;
      const printH = printW * imgRatio;

      if (printH <= pageH - margin * 2) {
        pdf.addImage(imgData, "PNG", margin, margin, printW, printH);
      } else {
        // Multi-page: slice canvas
        const sliceH = ((pageH - margin * 2) / printW) * canvas.width;
        let srcY = 0;
        let page = 0;
        while (srcY < canvas.height) {
          if (page > 0) pdf.addPage();
          const h = Math.min(sliceH, canvas.height - srcY);
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = h;
          const ctx = sliceCanvas.getContext("2d")!;
          ctx.drawImage(canvas, 0, srcY, canvas.width, h, 0, 0, canvas.width, h);
          const sliceImg = sliceCanvas.toDataURL("image/png");
          const slicePrintH = (h / canvas.width) * printW;
          pdf.addImage(sliceImg, "PNG", margin, margin, printW, slicePrintH);
          srcY += h;
          page++;
        }
      }

      pdf.save(`qr-stitky-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch {
      alert("Export PDF selhal. Zkuste tisk.");
    } finally {
      setExportingPdf(false);
    }
  }

  // Build label entries with duplicates for quantity > 1
  const labelEntries: LabelEntry[] = [];
  products
    .filter((p) => selected.has(p.id))
    .forEach((p) => {
      const qty = getQuantity(p.id);
      for (let i = 0; i < qty; i++) {
        labelEntries.push({ product: p, index: i });
      }
    });

  const size = LABEL_SIZES[labelSize];
  const allFilteredSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selected.has(p.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  if (previewing) {
    return (
      <>
        {/* Preview toolbar — hidden when printing */}
        <div className="mb-6 print:hidden">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setPreviewing(false)}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-background"
            >
              <ArrowLeft className="h-4 w-4" />
              Zpět na výběr
            </button>

            {/* Size switcher */}
            <div className="flex items-center gap-1 rounded-lg border border-border p-1">
              {(Object.entries(LABEL_SIZES) as [LabelSize, (typeof LABEL_SIZES)[LabelSize]][]).map(
                ([key, s]) => (
                  <button
                    key={key}
                    onClick={() => setLabelSize(key)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      labelSize === key
                        ? "bg-primary text-white"
                        : "text-muted hover:text-foreground"
                    }`}
                    title={s.desc}
                  >
                    {s.label}
                  </button>
                ),
              )}
            </div>

            <div className="flex-1" />

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              <Printer className="h-4 w-4" />
              Tisknout
            </button>
            <button
              onClick={handlePdfExport}
              disabled={exportingPdf}
              className="flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-40"
            >
              {exportingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Stáhnout PDF
            </button>
          </div>

          <p className="text-xs text-muted">
            {labelEntries.length} štítk{labelEntries.length === 1 ? "ek" : labelEntries.length < 5 ? "y" : "ů"} ·{" "}
            {size.label} ({size.mmW}×{size.mmH} mm) · {size.cols} sloupc{size.cols === 3 ? "e" : "ů"}
          </p>
        </div>

        {/* Label grid — visible on screen and when printing */}
        <div ref={previewRef}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${size.cols}, 1fr)`,
              gap: "12px",
            }}
          >
            {labelEntries.map((entry, i) => {
              const p = entry.product;
              const cat = PRODUCT_CATEGORY_LABELS[p.category as ProductCategory] ?? "";
              return (
                <div
                  key={`${p.id}-${entry.index}`}
                  style={{
                    breakInside: "avoid",
                    border: "1px solid #d1d5db",
                    borderRadius: "10px",
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    backgroundColor: "#fff",
                  }}
                >
                  {qrDataUrls[p.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrDataUrls[p.id]}
                      alt={`QR ${p.name}`}
                      style={{
                        width: `${size.qrPx}px`,
                        height: `${size.qrPx}px`,
                        marginBottom: "6px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: `${size.qrPx}px`,
                        height: `${size.qrPx}px`,
                        marginBottom: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f3f4f6",
                        borderRadius: "6px",
                      }}
                    >
                      <QrCode style={{ width: 32, height: 32, color: "#9ca3af" }} />
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: labelSize === "small" ? "10px" : "12px",
                      fontWeight: 700,
                      lineHeight: 1.2,
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: labelSize === "small" ? "nowrap" : "normal",
                    }}
                  >
                    {p.name}
                  </div>
                  <div style={{ fontSize: labelSize === "small" ? "12px" : "15px", fontWeight: 700, marginTop: "2px" }}>
                    {formatPrice(p.price_czk)}
                  </div>
                  {cat && (
                    <div style={{ fontSize: "9px", color: "#6b7280", marginTop: "1px" }}>
                      {cat}
                    </div>
                  )}
                  <div style={{ fontSize: "8px", color: "#9ca3af", marginTop: "1px" }}>
                    {p.slug}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Print-specific styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
@media print {
  @page { margin: 8mm; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`,
          }}
        />
      </>
    );
  }

  return (
    <>
      {/* Controls — hidden when printing */}
      <div className="mb-6 print:hidden">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">QR štítky produktů</h2>
            <p className="text-sm text-muted">
              Vyberte produkty, nastavte počet a velikost štítků
            </p>
          </div>
          <button
            onClick={generatePreview}
            disabled={selected.size === 0 || generating}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <QrCode className="h-4 w-4" />
            )}
            Generovat ({selected.size})
          </button>
        </div>

        {/* Size preset + category filter */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          {/* Size */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted">Velikost:</span>
            <div className="flex items-center gap-1 rounded-lg border border-border p-1">
              {(Object.entries(LABEL_SIZES) as [LabelSize, (typeof LABEL_SIZES)[LabelSize]][]).map(
                ([key, s]) => (
                  <button
                    key={key}
                    onClick={() => setLabelSize(key)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      labelSize === key
                        ? "bg-primary text-white"
                        : "text-muted hover:text-foreground"
                    }`}
                    title={s.desc}
                  >
                    {s.label}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs text-foreground"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white shadow-sm">
          {/* Select all */}
          <button
            onClick={toggleAll}
            className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-background"
          >
            {allFilteredSelected ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : (
              <Square className="h-4 w-4 text-muted" />
            )}
            Vybrat vše ({filteredProducts.length} produktů)
          </button>

          {/* Product list */}
          <div className="max-h-[50vh] overflow-y-auto">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 border-b border-border px-4 py-2.5 text-sm last:border-b-0"
              >
                <button
                  onClick={() => toggleProduct(p.id)}
                  className="flex flex-1 items-center gap-3 text-left hover:opacity-80"
                >
                  {selected.has(p.id) ? (
                    <CheckSquare className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <Square className="h-4 w-4 shrink-0 text-muted" />
                  )}
                  <span className="flex-1 truncate text-foreground">{p.name}</span>
                  <span className="shrink-0 font-medium text-muted">
                    {formatPrice(p.price_czk)}
                  </span>
                </button>
                {/* Quantity spinner */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted">×</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={getQuantity(p.id)}
                    onChange={(e) => setQuantity(p.id, parseInt(e.target.value) || 1)}
                    className="w-12 rounded border border-border px-1.5 py-1 text-center text-xs text-foreground"
                  />
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted">
                Žádné produkty v této kategorii
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function QrPrintPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="print:hidden">
        <AppHeader activeTab="eshop-admin" />
      </div>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted" />
            </div>
          }
        >
          <QrPrintContent />
        </Suspense>
      </main>
    </div>
  );
}
