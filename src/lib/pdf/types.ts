export type PdfType = "TextBased" | "Scanned" | "ImageBased" | "Mixed";
export type MarkdownProfile = "fidelity" | "compact";

export interface ProcessOptions {
  pages?: number[];
  password?: string;
  profile?: MarkdownProfile;
  includePageMarkers?: boolean;
  includeImages?: boolean;
}

export interface PageOcrReasons {
  page: number;
  reasons: string[];
}

export interface LayoutComplexity {
  isComplex: boolean;
  pagesWithTables: number[];
  pagesWithColumns: number[];
}

export interface PdfProcessResult {
  pdfType: PdfType;
  markdown?: string;
  pageCount: number;
  processingTimeMs: number;
  pagesNeedingOcr: number[];
  ocrReasonsByPage: PageOcrReasons[];
  title?: string;
  confidence: number;
  layout: LayoutComplexity;
  hasEncodingIssues: boolean;
}
