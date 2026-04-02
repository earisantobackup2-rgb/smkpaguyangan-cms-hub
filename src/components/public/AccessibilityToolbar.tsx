import { useState, useEffect } from "react";
import { Eye, Type, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  const increase = () => setFontSize((v) => Math.min(v + 10, 150));
  const decrease = () => setFontSize((v) => Math.max(v - 10, 80));
  const reset = () => { setFontSize(100); setHighContrast(false); };

  return (
    <>
      {/* Skip Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-semibold"
      >
        Langsung ke konten utama
      </a>

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Aksesibilitas"
        title="Aksesibilitas"
      >
        <Eye className="h-5 w-5" />
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-56 rounded-xl bg-card border shadow-elevated p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Aksesibilitas</p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Type className="h-3 w-3" /> Ukuran Teks</span>
            <div className="flex gap-1">
              <button onClick={decrease} className="rounded p-1 hover:bg-muted" aria-label="Perkecil teks"><ZoomOut className="h-4 w-4" /></button>
              <span className="text-xs w-8 text-center leading-6">{fontSize}%</span>
              <button onClick={increase} className="rounded p-1 hover:bg-muted" aria-label="Perbesar teks"><ZoomIn className="h-4 w-4" /></button>
            </div>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-muted-foreground">Kontras Tinggi</span>
            <button
              role="switch"
              aria-checked={highContrast}
              onClick={() => setHighContrast(!highContrast)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${highContrast ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${highContrast ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </label>

          <button onClick={reset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      )}
    </>
  );
}
