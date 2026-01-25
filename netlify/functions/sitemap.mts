import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  // ambil domain yang lagi dipakai (paling aman)
  const host =
    event.headers["x-forwarded-host"] ||
    event.headers["host"] ||
    "syntheticgood.site";

  const siteUrl = `https://${host}`;

  // TODO: isi URL penting yang mau masuk sitemap
  const urls = [
    `${siteUrl}/`,
    // `${siteUrl}/admin`,  // kalau mau
  ];

  const now = new Date().toISOString();

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls
      .map((u) => `<url><loc>${u}</loc><lastmod>${now}</lastmod></url>`)
      .join("") +
    `</urlset>`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
    body,
  };
};
