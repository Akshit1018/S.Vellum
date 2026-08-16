import { useCallback, useEffect, useRef, useState } from "react";
import type { PdfProcessResult, ProcessOptions } from "@/lib/pdf/types";

const MAX_FILE_SIZE = 80 * 1024 * 1024;

type Engine = {
  processPdf: (
    data: Uint8Array,
    options?: ProcessOptions,
  ) => PdfProcessResult;
};

async function loadEngine(): Promise<Engine> {
  const [{ default: init, processPdf }, wasmUrl] = await Promise.all([
    import("@firecrawl/pdf-inspector-wasm"),
    import("@firecrawl/pdf-inspector-wasm/pdf_inspector_wasm_bg.wasm?url").then(
      (m) => m.default,
    ),
  ]);
  await init({ module_or_path: wasmUrl });
  return { processPdf };
}

export function usePdfProcessor() {
  const engineRef = useRef<Engine | null>(null);
  const queuedRef = useRef<{ file: File; options?: ProcessOptions } | null>(
    null,
  );
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PdfProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);

  const run = useCallback(
    async (file: File, options?: ProcessOptions, engine?: Engine) => {
      const eng = engine ?? engineRef.current;
      if (!eng) {
        queuedRef.current = { file, options };
        setFileName(file.name);
        setError(null);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(
          `This file is ${(file.size / 1024 / 1024).toFixed(1)} MB. Keep it under 80 MB.`,
        );
        return;
      }
      const looksPdf =
        file.type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf");
      if (!looksPdf) {
        setError(
          "Choose a PDF from Files or Documents — PDFs are not in the photo gallery.",
        );
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);
      setFileName(file.name);

      try {
        const buffer = await file.arrayBuffer();
        await new Promise((r) => window.setTimeout(r, 30));
        const res = eng.processPdf(new Uint8Array(buffer), options ?? {
          profile: "fidelity",
          includePageMarkers: true,
        });
        setResult(res);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not read that PDF.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const engine = await loadEngine();
        if (cancelled) return;
        engineRef.current = engine;
        setReady(true);
        setEngineError(null);
        const queued = queuedRef.current;
        if (queued) {
          queuedRef.current = null;
          await run(queued.file, queued.options, engine);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("WASM engine failed", err);
        setEngineError(
          err instanceof Error ? err.message : "Failed to load the local engine",
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [run]);

  const process = useCallback(
    (file: File, options?: ProcessOptions) => run(file, options),
    [run],
  );

  const reset = useCallback(() => {
    queuedRef.current = null;
    setResult(null);
    setError(null);
    setFileName(null);
    setLoading(false);
  }, []);

  return {
    ready,
    loading,
    result,
    error,
    fileName,
    process,
    reset,
    engineError,
  };
}
