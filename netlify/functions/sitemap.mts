import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://syntheticgoodsite.site";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

function escXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const handler: Handler = async () => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("slug, updated_at")
      .eq("status", "published")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    const urls = (data ?? []).map((p) => {
      const loc = `${SITE_URL}/${p.slug}`;
      const lastmod = p.updated_at ? new Date(p.updated_at).toISOString() : "";
      return `
  <url>
    <loc>${escXml(loc)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
  </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return {
      statusCode: 200,
      headers: { "content-type": "application/xml; charset=UTF-8" },
      body: xml,
    };
  } catch (e: any) {
    return {
      statusCode: 500,
      headers: { "content-type": "text/plain; charset=UTF-8" },
      body: `sitemap error: ${e?.message ?? String(e)}`,
    };
  }
};
