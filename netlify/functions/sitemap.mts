import type { Handler } from "@netlify/functions";

const SITE = "https://syntheticgood.site";

// Tambah/kurangin halaman statis lu di sini
const STATIC_PATHS = ["/", "/gemini-prompt", "/chatgpt-prompt", "/admin"];

function xmlEscape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildXml(urls: string[]) {
  const now = new Date().toISOString();
  const body = urls
    .map((u) => {
      const loc = u.startsWith("http") ? u : `${SITE}${u}`;
      return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${now}</lastmod>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

export const handler: Handler = async () => {
  // sementara: sitemap berisi halaman statis dulu biar ga cuma 1
  const urls = Array.from(new Set(STATIC_PATHS));

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
    body: buildXml(urls),
  };
};
