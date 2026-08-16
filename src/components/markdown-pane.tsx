import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownPane({
  markdown,
  raw,
}: {
  markdown: string;
  raw: boolean;
}) {
  if (raw) {
    return (
      <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink-soft">
        {markdown}
      </pre>
    );
  }
  return (
    <div className="manuscript">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
