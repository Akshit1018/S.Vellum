/// <reference lib="webworker" />
import init, { processPdf } from "@firecrawl/pdf-inspector-wasm";
import wasmUrl from "@firecrawl/pdf-inspector-wasm/pdf_inspector_wasm_bg.wasm?url";
import type { PdfProcessResult, ProcessOptions } from "./types";

let initialized = false;

async function ensureInit() {
  if (initialized) return;
  await init({ module_or_path: wasmUrl });
  initialized = true;
}

self.onmessage = async (event: MessageEvent) => {
  const { id, type, buffer, options } = event.data as {
    id: number;
    type: "init" | "process";
    buffer?: ArrayBuffer;
    options?: ProcessOptions;
  };

  try {
    if (type === "init") {
      await ensureInit();
      self.postMessage({ id, type: "ready" });
      return;
    }

    if (type === "process") {
      await ensureInit();
      if (!buffer) throw new Error("No PDF data received");
      const result = processPdf(
        new Uint8Array(buffer),
        options ?? {},
      ) as PdfProcessResult;
      self.postMessage({ id, type: "result", result });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    self.postMessage({ id, type: "error", error: message });
  }
};

export {};
