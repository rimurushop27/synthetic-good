import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const handler: Handler = async (event, context) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://mdpyyaopokewvrumdpwd.supabase.co";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_xBoLox4NHFRMmPOqqqgqfA_G37DbQf6";

  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 500,
      body: 'Missing Supabase credentials',
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch all published posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select('slug, updated_at, category, primary_tag')
    .eq('status', 'published');

  if (error) {
    console.error('Error fetching posts:', error);
    return {
      statusCode: 500,
      body: 'Error fetching posts',
    };
  }

  const baseUrl = 'https://syntheticgood.site';
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  posts?.forEach((post) => {
    const isChatGPT = (post.category || '').toLowerCase().includes('chatgpt') || 
                      (post.primary_tag || '').toLowerCase().includes('chatgpt');
    const route = isChatGPT ? 'chatgpt-prompt' : 'gemini-prompt';
    const slug = post.slug;
    const url = `${baseUrl}/${route}/${slug}`;
    const lastMod = post.updated_at ? new Date(post.updated_at).toISOString() : new Date().toISOString();

    sitemap += `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  sitemap += `
</urlset>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
    body: sitemap,
  };
};

export { handler };
