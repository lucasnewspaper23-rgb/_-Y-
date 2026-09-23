function slugify(title: string): string {
  const trimmed = title.trim() || "document";
  return trimmed.replace(/[^\w\-]+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function wrapHtmlDocument(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 12pt; line-height: 1.5; color: #1f2328; }
  table { border-collapse: collapse; }
  table, th, td { border: 1px solid #444; padding: 4px 8px; }
  img { max-width: 100%; }
  h1, h2, h3, h4 { font-family: Calibri, Arial, sans-serif; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

export function exportAsHtml(title: string, html: string) {
  const full = wrapHtmlDocument(title, html);
  download(new Blob([full], { type: "text/html" }), `${slugify(title)}.html`);
}

export function exportAsText(title: string, text: string) {
  download(new Blob([text], { type: "text/plain" }), `${slugify(title)}.txt`);
}

export async function exportAsDocx(title: string, html: string) {
  const { asBlob } = await import("html-docx-js-typescript");
  const full = wrapHtmlDocument(title, html);
  const result = await asBlob(full);
  const blob = result instanceof Blob ? result : new Blob([new Uint8Array(result)]);
  download(blob, `${slugify(title)}.docx`);
}
