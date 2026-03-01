
export type CategoryType = 'All' | 'Couple' | 'Boy' | 'Girl' | 'Girl Hijab';

export interface Post {
  id: string; // uuid
  title?: string;
  image_url: string;
  prompt: string;
  category: string;
  creator: string;
  creator_url: string;
  slug: string;
  created_at: string;
  like_count: number;
  use_count: number;
  status?: 'draft' | 'published';
  publish_at?: string | null;
  primary_tag?: string;
  tags?: string[];
}

export interface SiteBanner {
  id: string;
  placement: 'top' | 'bottom';
  is_active: boolean;
  badge_text: string;
  pack_label: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_url: string;
  updated_at?: string;
}

export interface AppSettings {
  supabaseUrl: string;
  supabaseKey: string;
  defaultCreator: string;
  defaultCreatorUrl: string;
  socials: {
    instagram: string;
    facebook: string;
    tiktok: string;
    whatsapp: string;
    telegram: string;
  }
}

export const DEFAULT_SETTINGS: AppSettings = {
  supabaseUrl: "",
  supabaseKey: "",
  defaultCreator: "Admin",
  defaultCreatorUrl: "http://t.me/synthetic_good",
  socials: {
    instagram: "http://t.me/synthetic_good",
    facebook: "https://www.facebook.com/rimurushop27",
    tiktok: "https://www.tiktok.com/@rimuru_shop27",
    whatsapp: "https://whatsapp.com/channel/0029VbBWdG3EFeXoCJJozq2M",
    telegram: "http://t.me/synthetic_good"
  }
};
