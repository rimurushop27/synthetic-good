
import React, { useState, useEffect } from 'react';
import { Copy, Heart, Check, User, Sparkles, ArrowLeft, ExternalLink, AlertTriangle, Share2 } from 'lucide-react';
import { Post, SiteBanner as SiteBannerType } from '../types';
import { incrementLike, incrementUse } from '../services/supabaseService';
import SiteBanner from './SiteBanner';

interface PostDetailProps {
  post: Post | null; // Allow null for 404 state
  onBack: () => void;
  banners: { top: SiteBannerType | null, bottom: SiteBannerType | null };
}

const PostDetail: React.FC<PostDetailProps> = ({ post, onBack, banners }) => {
  const [likes, setLikes] = useState(post?.like_count || 0);
  const [uses, setUses] = useState(post?.use_count || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  // SEO & Meta Tags Effect
  useEffect(() => {
    if (!post) {
      document.title = "Page Not Found • Synthetic Good";
      return;
    }

    // Helper to update meta tag
    const updateMeta = (selector: string, attribute: string, value: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        // Parse selector simply for this use case
        if (selector.includes('[name=')) {
           el.setAttribute('name', selector.split('="')[1].replace('"]', ''));
        } else if (selector.includes('[property=')) {
           el.setAttribute('property', selector.split('="')[1].replace('"]', ''));
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attribute, value);
    };

    // Construct Data
    const tagTitle = post.primary_tag 
      ? post.primary_tag.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') 
      : 'AI Prompt';
    const pageTitle = `${tagTitle} • ${post.category} — Synthetic Good`;
    const description = post.prompt.length > 150 ? post.prompt.substring(0, 150) + "..." : post.prompt;
    const tagSlug = post.primary_tag ? post.primary_tag.replace(/\s+/g, '-') : 'p';
    const canonicalUrl = `https://syntheticgood.site/${tagSlug}/${post.slug}`;

    // Update Title
    document.title = pageTitle;

    // Update Canonical
    let linkCanon = document.querySelector('link[rel="canonical"]');
    if (!linkCanon) {
      linkCanon = document.createElement('link');
      linkCanon.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanon);
    }
    linkCanon.setAttribute('href', canonicalUrl);

    // Update Meta Tags (Open Graph / Twitter)
    updateMeta('meta[name="description"]', 'content', description);
    
    // OG
    updateMeta('meta[property="og:title"]', 'content', pageTitle);
    updateMeta('meta[property="og:description"]', 'content', description);
    updateMeta('meta[property="og:image"]', 'content', post.image_url);
    updateMeta('meta[property="og:url"]', 'content', canonicalUrl);
    updateMeta('meta[property="og:type"]', 'content', 'article');
    
    // Twitter
    updateMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    updateMeta('meta[name="twitter:title"]', 'content', pageTitle);
    updateMeta('meta[name="twitter:description"]', 'content', description);
    updateMeta('meta[name="twitter:image"]', 'content', post.image_url);

    // Cleanup function to reset title when leaving (optional)
    return () => {
       document.title = "Synthetic Good - Free Prompt";
    };

  }, [post]);

  useEffect(() => {
    if (!post) return;
    const likedPosts = JSON.parse(localStorage.getItem('likedPostIds') || '[]');
    if (likedPosts.includes(post.id)) setIsLiked(true);
  }, [post?.id]);

  // --- 404 UI ---
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center animate-fade-in">
         <div className="neon-card p-10 flex flex-col items-center gap-4">
             <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30 mb-2">
                 <AlertTriangle size={40} className="text-red-400" />
             </div>
             <h1 className="text-3xl font-bold text-white">Post Not Found</h1>
             <p className="text-[var(--text-muted)] mb-6">
                 The prompt you are looking for might have been removed or the URL is incorrect.
             </p>
             <button 
                onClick={onBack}
                className="neon-button px-8 py-3 rounded-full font-bold flex items-center gap-2"
             >
                <ArrowLeft size={18} /> Back to Home
             </button>
         </div>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post.prompt);
      setCopied(true);
      setUses(prev => prev + 1);
      incrementUse(post.id);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { console.error(err); }
  };

  const handleLike = async () => {
    if (isLiked) return;
    setLikes(prev => prev + 1);
    setIsLiked(true);
    const likedPosts = JSON.parse(localStorage.getItem('likedPostIds') || '[]');
    localStorage.setItem('likedPostIds', JSON.stringify([...likedPosts, post.id]));
    await incrementLike(post.id);
  };

  const handleShare = async () => {
    if (!post) return;
    
    // Build URL based on category/type
    const PUBLIC_SITE_URL = "https://syntheticgood.site";
    const isChatGPT = (post.category || '').toLowerCase().includes('chatgpt') || 
                      (post.primary_tag || '').toLowerCase().includes('chatgpt');
    const route = isChatGPT ? 'chatgpt-prompt' : 'gemini-prompt';
    const slug = post.slug || post.id;
    const url = `${PUBLIC_SITE_URL}/${route}/${slug}`;

    const title = "Get Prompt";
    const shareText = `Get Prompt\n${url}`;

    if (!navigator.share) {
        await navigator.clipboard.writeText(url);
        alert("URL post disalin");
        return;
    }

    try {
        let files: File[] = [];
        try {
            const response = await fetch(post.image_url);
            const blob = await response.blob();
            const file = new File([blob], 'image.jpg', { type: blob.type });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                files = [file];
            }
        } catch (e) {
            console.warn("Failed to prepare image for sharing", e);
        }

        if (files.length > 0) {
            await navigator.share({ 
                title, 
                text: shareText, 
                files 
            });
        } else {
            await navigator.share({ 
                title, 
                text: shareText,
                url 
            });
        }
    } catch (err) {
        console.error("Share failed", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--neon-blue)] hover:text-white transition-colors font-medium group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
      </div>

      <SiteBanner banner={banners.top} variant="top" />

      <div className="neon-card mb-8">
        {/* Large Image */}
        <div className="relative w-full bg-black z-10">
          <img 
            src={post.image_url} 
            alt={post.title} 
            className="w-full h-auto max-h-[80vh] object-contain mx-auto"
          />
          
          {/* Header Overlay */}
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
             <span className="bg-black/60 text-[var(--neon-blue)] border border-[var(--neon-blue-soft)] px-3 py-1 text-xs font-bold uppercase rounded">{post.category}</span>
          </div>
        </div>

        <div className="p-6 md:p-8 relative z-10 bg-transparent">
          {/* Creator & Title */}
          <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
             <div>
                <h1 className="text-2xl font-bold text-white mb-2">{post.title || "Untitled Prompt"}</h1>
                <div className="flex items-center gap-2">
                   <User size={14} className="text-[var(--neon-blue)]" />
                   {post.creator_url ? (
                     <a href={post.creator_url} target="_blank" rel="noreferrer" className="text-sm text-gray-300 hover:text-[var(--neon-blue)] flex items-center gap-1">
                       {post.creator} <ExternalLink size={12} />
                     </a>
                   ) : (
                     <span className="text-sm text-gray-300">{post.creator}</span>
                   )}
                </div>
             </div>
             
             {/* Stats Actions */}
             <div className="flex gap-4">
                <button 
                  onClick={handleLike}
                  disabled={isLiked}
                  className={`flex flex-col items-center gap-1 ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                >
                  <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                  <span className="text-xs font-bold">{likes}</span>
                </button>
                <div className="flex flex-col items-center gap-1 text-[var(--neon-blue)]">
                  <Sparkles size={24} />
                  <span className="text-xs font-bold">{uses}</span>
                </div>
             </div>
          </div>

          {/* Prompt Section */}
          <div className="relative bg-black/30 border border-white/10 rounded-lg p-6 group">
            <h3 className="text-[var(--neon-blue)] text-sm font-bold uppercase tracking-wider mb-3">Prompt</h3>
            <p className="text-[var(--text-primary)] leading-relaxed font-light text-base md:text-lg mb-4 whitespace-pre-wrap select-text">
               {post.prompt}
            </p>
            
            <div className="flex flex-col md:flex-row gap-3">
              <button 
                onClick={handleCopy}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                  copied 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40' 
                  : 'neon-button'
                }`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied to Clipboard' : 'Copy Prompt'}
              </button>
              
              <button 
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all bg-white/5 hover:bg-white/10 text-white border border-white/10"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <SiteBanner banner={banners.bottom} variant="bottom" />
    </div>
  );
};

export default PostDetail;
