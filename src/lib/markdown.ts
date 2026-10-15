import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

/** Render admin-authored markdown. Raw <script>/<iframe> tags and inline handlers are stripped. */
export function renderMarkdown(md: string) {
  const html = marked.parse(md || "", { async: false }) as string;
  return html
    .replace(/<\s*(script|iframe|object|embed|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/\son\w+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');
}
