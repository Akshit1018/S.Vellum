import type { PdfType } from "@/lib/pdf/types";
import { cn } from "@/lib/utils";

const COPY: Record<PdfType, { label: string; tone: string }> = {
  TextBased: { label: "Native text", tone: "bg-ok-bg text-ok" },
  Mixed: { label: "Mixed pages", tone: "bg-warn-bg text-warn" },
  Scanned: { label: "Scanned", tone: "bg-warn-bg text-warn" },
  ImageBased: { label: "Image only", tone: "bg-danger-bg text-danger" },
};

export function TypeStamp({ type }: { type: PdfType }) {
  const meta = COPY[type] ?? COPY.Mixed;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-wide",
        meta.tone,
      )}
    >
      {meta.label}
    </span>
  );
}
