import { useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileText,
  FolderOpen,
  Loader2,
  RotateCcw,
  Share2,
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { AuthSlot } from "@/components/auth-slot";
import { MarkdownPane } from "@/components/markdown-pane";
import { TypeStamp } from "@/components/type-stamp";
import { Button } from "@/components/ui/button";
import { usePdfProcessor } from "@/hooks/use-pdf-processor";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const {
    ready,
    loading,
    result,
    error,
    fileName,
    process,
    reset,
    engineError,
  } = usePdfProcessor();
  const [raw, setRaw] = useState(false);
  const [compact, setCompact] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const options = {
    profile: compact ? ("compact" as const) : ("fidelity" as const),
    includePageMarkers: true,
  };

  const submit = (file: File) => {
    void process(file, options);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) submit(file);
    e.target.value = "";
  };

  const openPicker = () => {
    const el = inputRef.current ?? document.getElementById("vellum-pdf");
    if (el instanceof HTMLInputElement && !loading) {
      el.click();
    }
  };

  const trySample = async () => {
    try {
      const res = await fetch("/sample.pdf");
      if (!res.ok) throw new Error("Sample is missing");
      const blob = await res.blob();
      const file = new File([blob], "sample.pdf", { type: "application/pdf" });
      submit(file);
    } catch {
      /* ignore */
    }
  };

  const copy = async () => {
    if (!result?.markdown) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const download = () => {
    if (!result?.markdown) return;
    const blob = new Blob([result.markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileName?.replace(/\.pdf$/i, "") || "vellum") + ".md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    if (!result?.markdown || !navigator.share) return;
    try {
      await navigator.share({
        title: result.title || fileName || "Vellum",
        text: result.markdown.slice(0, 1800),
      });
    } catch {
      /* cancelled */
    }
  };

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/85 px-4 py-3 backdrop-blur-md pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-xl italic tracking-tight">
              Vellum
            </span>
            <span className="hidden text-xs tracking-wide text-faint sm:inline">
              On-device PDF → Markdown
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs tabular-nums text-muted">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  engineError
                    ? "bg-danger"
                    : ready
                      ? "bg-moss"
                      : "bg-warn animate-pulse",
                )}
              />
              {engineError
                ? "Engine error"
                : ready
                  ? "Engine ready"
                  : "Waking engine"}
            </span>
            <AuthSlot />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:pt-12">
        {!result && !loading && (
          <section className="fade-rise mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Private desk
            </p>
            <h1 className="mt-3 font-display text-3xl font-medium leading-[1.1] tracking-[-0.035em] text-ink sm:text-5xl">
              The text,
              <br />
              without the file.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted">
              Vellum reads native PDF structure and writes clean Markdown.
              Nothing is uploaded. Scanned pages are flagged, not guessed.
            </p>
          </section>
        )}

        {engineError && (
          <div className="mx-auto mt-6 max-w-2xl rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger">
            Could not start the local engine: {engineError}
          </div>
        )}

        <section
          className={cn("mx-auto mt-8 max-w-2xl", result && "max-w-5xl")}
        >
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOver(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) submit(file);
            }}
            className={cn(
              "relative flex min-h-52 flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border bg-paper-deep/40 px-6 py-10 text-center transition-colors duration-200",
              dragOver ? "border-moss bg-ok-bg/50" : "border-line",
              loading && "opacity-70",
            )}
          >
            {/*
              Real, full-area file input. Never display:none / sr-only / disabled
              for readiness — those block the system picker on phones.
            */}
            <input
              id="vellum-pdf"
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="file-hit"
              onChange={onPick}
              disabled={loading}
            />

            <div className="pointer-events-none relative z-[1] flex flex-col items-center gap-3">
              {loading ? (
                <Loader2 className="size-6 animate-spin text-moss" />
              ) : (
                <span className="flex size-12 items-center justify-center rounded-full bg-ink/5">
                  <FileText className="size-5 text-ink-soft" strokeWidth={1.5} />
                </span>
              )}
              <div>
                <p className="font-display text-lg italic text-ink">
                  {loading ? "Reading the page structure…" : "Choose a PDF"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {loading
                    ? "Stays on this device"
                    : "Opens Files / Documents — not the photo gallery."}
                </p>
              </div>
              <span className="inline-flex h-11 items-center rounded-md bg-ink px-5 text-sm font-medium text-paper">
                {loading ? "Working…" : "Browse files"}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <label className="inline-flex min-h-11 items-center gap-2 text-muted">
              <input
                type="checkbox"
                checked={compact}
                onChange={(e) => setCompact(e.target.checked)}
                className="size-4 accent-moss"
              />
              Compact Markdown
            </label>
            <button
              type="button"
              onClick={openPicker}
              disabled={loading}
              className="inline-flex min-h-11 items-center gap-1.5 text-moss hover:underline disabled:opacity-40"
            >
              <FolderOpen className="size-3.5" />
              Open file picker
            </button>
            <button
              type="button"
              onClick={() => void trySample()}
              disabled={loading}
              className="inline-flex min-h-11 items-center text-muted hover:text-ink disabled:opacity-40"
            >
              Try a sample
            </button>
            {fileName && (
              <button
                type="button"
                onClick={reset}
                className="ml-auto inline-flex min-h-11 items-center gap-1.5 text-muted hover:text-ink"
              >
                <RotateCcw className="size-3.5" />
                Clear
              </button>
            )}
          </div>
        </section>

        {error && (
          <div className="fade-rise mx-auto mt-6 max-w-2xl rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {result && (
          <section className="fade-rise mt-10 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <div>
                <TypeStamp type={result.pdfType} />
                {result.title && (
                  <h2 className="mt-3 font-display text-xl font-medium leading-snug tracking-tight">
                    {result.title}
                  </h2>
                )}
                {fileName && (
                  <p className="mt-1 truncate text-xs text-faint">{fileName}</p>
                )}
              </div>

              <dl className="grid grid-cols-3 gap-3 text-sm lg:grid-cols-1">
                <Stat
                  label="Confidence"
                  value={`${Math.round(result.confidence * 100)}%`}
                />
                <Stat label="Pages" value={String(result.pageCount)} />
                <Stat
                  label="Time"
                  value={`${result.processingTimeMs} ms`}
                />
              </dl>

              {result.pagesNeedingOcr.length > 0 && (
                <p className="rounded-md bg-warn-bg px-3 py-2.5 text-sm text-warn">
                  {result.pagesNeedingOcr.length} page
                  {result.pagesNeedingOcr.length === 1 ? "" : "s"} need OCR
                  <span className="mt-1 block text-xs opacity-80">
                    {result.pagesNeedingOcr.join(", ")}
                  </span>
                </p>
              )}

              {result.hasEncodingIssues && (
                <p className="rounded-md bg-danger-bg px-3 py-2.5 text-sm text-danger">
                  Broken font encodings. Some glyphs may be wrong.
                </p>
              )}

              {result.layout?.isComplex && (
                <p className="text-xs leading-relaxed text-muted">
                  Complex layout
                  {result.layout.pagesWithTables.length > 0 &&
                    ` · tables ${result.layout.pagesWithTables.join(", ")}`}
                  {result.layout.pagesWithColumns.length > 0 &&
                    ` · columns ${result.layout.pagesWithColumns.join(", ")}`}
                </p>
              )}
            </aside>

            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={raw ? "ghost" : "primary"}
                  onClick={() => setRaw(false)}
                >
                  Manuscript
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={raw ? "primary" : "ghost"}
                  onClick={() => setRaw(true)}
                >
                  Source
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => void copy()}
                  disabled={!result.markdown}
                >
                  {copied ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={download}
                  disabled={!result.markdown}
                >
                  <Download className="size-3.5" />
                  Download
                </Button>
                {"share" in navigator && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => void share()}
                    disabled={!result.markdown}
                  >
                    <Share2 className="size-3.5" />
                    Share
                  </Button>
                )}
              </div>

              <article className="rounded-xl border border-line bg-paper px-5 py-6 sm:px-8 sm:py-8">
                {result.markdown ? (
                  <div className="max-h-[70vh] overflow-y-auto">
                    <MarkdownPane markdown={result.markdown} raw={raw} />
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="font-display text-lg italic">No native text</p>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                      This file looks fully scanned or image-based. Vellum
                      extracts structure, not pixels — send those pages to OCR.
                    </p>
                  </div>
                )}
              </article>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] text-faint">
        {label}
      </dt>
      <dd className="mt-0.5 font-display text-lg tabular-nums tracking-tight">
        {value}
      </dd>
    </div>
  );
}
