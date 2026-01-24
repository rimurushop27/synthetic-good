
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Post, CategoryType, AppSettings, DEFAULT_SETTINGS } from '../types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

const STORAGE_KEY = 'synthetic_app_settings';

// --- Configuration Helper ---
export const getSettings = (): AppSettings => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const baseSettings = {
    ...DEFAULT_SETTINGS,
    supabaseUrl: SUPABASE_URL || "",
    supabaseKey: SUPABASE_ANON_KEY || ""
  };

  if (stored) {
    return { ...baseSettings, ...JSON.parse(stored) };
  }
  return baseSettings;
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

// --- Client Factory ---
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  const settings = getSettings();
  
  if (settings.supabaseUrl && settings.supabaseKey) {
    try {
      supabaseInstance = createClient(settings.supabaseUrl, settings.supabaseKey);
      return supabaseInstance;
    } catch (e) {
      console.error("Invalid Supabase Config", e);
      return null;
    }
  }
  return null;
};

export const resetSupabase = () => {
  supabaseInstance = null;
};

// --- Data Fetching ---

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();
    
  if (error || !data) return null;
  
  return data as Post;
};

export const getViralPosts = async (): Promise<Post[]> => {
  const sb = getSupabase();
  if (!sb) return [];

  const now = new Date().toISOString();
  
  // Public Filter: 
  // 1. Status is 'published' OR null (legacy)
  // 2. Publish date is passed OR null (legacy)
  const { data, error } = await sb
    .from('posts')
    .select('*')
    .or('status.eq.published,status.is.null') 
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .limit(50);

  if (error) {
    console.error('Viral fetch error:', error);
    return [];
  }
  
  const posts = data as Post[];
  
  // Sort by (like_count + use_count) descending
  return posts.sort((a, b) => (b.like_count + b.use_count) - (a.like_count + a.use_count)).slice(0, 10);
};

export const getNewPosts = async (page: number, pageSize: number, category: CategoryType) => {
  const sb = getSupabase();
  if (!sb) return { data: [], count: 0 };

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const now = new Date().toISOString();

  let query = sb
    .from('posts')
    .select('*', { count: 'exact' })
    .or('status.eq.published,status.is.null')
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    // Sort logic: Scheduled posts usually have dates, legacy uses created_at
    .order('created_at', { ascending: false }) 
    .range(from, to);

  if (category !== 'All') {
    query = query.eq('category', category);
  }

  const { data, count, error } = await query;
  
  if (error) {
    console.error('New posts error:', error);
    return { data: [], count: 0 };
  }
  
  return { data: data as Post[], count: count || 0 };
};

// --- Admin Management ---

export const getAdminPosts = async (limit: number = 50): Promise<Post[]> => {
    const sb = getSupabase();
    if (!sb) return [];
    
    // Admin sees ALL (drafts, scheduled, published)
    const { data, error } = await sb
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
        
    if (error) throw error;
    return data as Post[];
};

export const deletePost = async (id: string, imageUrl: string) => {
    const sb = getSupabase();
    if (!sb) throw new Error("No connection");

    const { error } = await sb.from('posts').delete().eq('id', id);
    if (error) throw error;

    try {
        const path = imageUrl.split('/post-images/')[1];
        if (path) {
            await sb.storage.from('post-images').remove([path]);
        }
    } catch (e) {
        console.warn("Could not delete image file", e);
    }
};

// --- Interactions ---

export const incrementLike = async (postId: string) => {
  const sb = getSupabase();
  if (!sb) return;
  await sb.rpc('increment_like', { post_id: postId });
};

export const incrementUse = async (postId: string) => {
  const sb = getSupabase();
  if (!sb) return;
  await sb.rpc('increment_use', { post_id: postId });
};

// --- Admin & Auth ---

export const checkSession = async () => {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: { session } } = await sb.auth.getSession();
  
  if (session) {
     const { data: isAdmin } = await sb.rpc('is_admin');
     if (isAdmin) return session;
     await sb.auth.signOut();
  }
  return null;
}

export const signInAdmin = async (email: string, pass: string) => {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase not configured");
  
  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
  if (error) throw error;
  
  const { data: isAdmin } = await sb.rpc('is_admin');
  if (!isAdmin) {
    await sb.auth.signOut();
    throw new Error("Access Denied: Not an admin account");
  }
  return data.session;
};

export const signOutAdmin = async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
};

export const uploadImage = async (file: File): Promise<string> => {
  const sb = getSupabase();
  if (!sb) throw new Error("No connection");

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2,8)}.${fileExt}`;
  const filePath = `posts/${fileName}`;

  const { error } = await sb.storage.from('post-images').upload(filePath, file);
  if (error) throw error;

  const { data } = sb.storage.from('post-images').getPublicUrl(filePath);
  return data.publicUrl;
};

export const createPost = async (post: Partial<Post>) => {
  const sb = getSupabase();
  if (!sb) throw new Error("No connection");
  
  // Ensure we are inserting valid data types based on schema
  const payload = {
      ...post,
      // Fallback defaults if not provided
      like_count: 0,
      use_count: 0
  };

  const { error } = await sb.from('posts').insert([payload]);
  if (error) throw error;
};

export const generateSlug = () => {
    return Math.random().toString(36).substring(2, 8); // 6 chars
};
