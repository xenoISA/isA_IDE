interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Lightweight regex-based markdown renderer.
 * Supports: headings, paragraphs, bold, italic, inline code, code blocks,
 * unordered/ordered lists, tables, and horizontal rules.
 */
export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const html = markdownToHtml(content);

  return (
    <div
      className={`markdown-content text-xs text-text-secondary leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineMarkdown(text: string): string {
  let result = escapeHtml(text);
  // Inline code (must be before bold/italic to avoid conflicts)
  result = result.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  // Bold
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  result = result.replace(/_(.+?)_/g, "<em>$1</em>");
  return result;
}

function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block (fenced)
    if (line.trimStart().startsWith("```")) {
      const lang = line.trimStart().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(escapeHtml(lines[i]));
        i++;
      }
      i++; // skip closing ```
      output.push(
        `<pre class="code-block${lang ? ` lang-${lang}` : ""}"><code>${codeLines.join("\n")}</code></pre>`
      );
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
      output.push('<hr class="md-hr" />');
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      output.push(`<h${level} class="md-h${level}">${inlineMarkdown(headingMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    // Table (detect header row with | separators)
    if (line.includes("|") && i + 1 < lines.length && /^\s*\|?[\s-:|]+\|/.test(lines[i + 1])) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      output.push(renderTable(tableLines));
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        listItems.push(inlineMarkdown(lines[i].replace(/^\s*[-*+]\s+/, "")));
        i++;
      }
      output.push(`<ul class="md-ul">${listItems.map((li) => `<li>${li}</li>`).join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        listItems.push(inlineMarkdown(lines[i].replace(/^\s*\d+\.\s+/, "")));
        i++;
      }
      output.push(`<ol class="md-ol">${listItems.map((li) => `<li>${li}</li>`).join("")}</ol>`);
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph
    output.push(`<p class="md-p">${inlineMarkdown(line)}</p>`);
    i++;
  }

  return output.join("");
}

function renderTable(lines: string[]): string {
  const parseCells = (row: string) =>
    row
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c !== "");

  if (lines.length < 2) return "";

  const headers = parseCells(lines[0]);
  // lines[1] is separator — skip
  const rows = lines.slice(2).map(parseCells);

  const thead = `<thead><tr>${headers
    .map((h) => `<th>${inlineMarkdown(h)}</th>`)
    .join("")}</tr></thead>`;
  const tbody = `<tbody>${rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`
    )
    .join("")}</tbody>`;

  return `<table class="md-table">${thead}${tbody}</table>`;
}
