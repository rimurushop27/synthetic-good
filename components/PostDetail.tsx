
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
         <div className="brutal-card p-10 flex flex-col items-center gap-4 bg-[var(--surface)]">
             <div className="w-20 h-20 bg-[var(--accent-pink)] rounded flex items-center justify-center border-4 border-[#111] shadow-[4px_4px_0_0_#111] mb-2">
                 <AlertTriangle size={40} className="text-white" />
             </div>
             <h1 className="text-3xl font-bold text-[#111]">Post Not Found</h1>
             <p className="text-[#555] mb-6 font-medium">
                 The prompt you are looking for might have been removed or the URL is incorrect.
             </p>
             <button 
                onClick={onBack}
                className="brutal-button px-8 py-3 bg-[var(--accent-yellow)] text-[#111] flex items-center gap-2"
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
          className="flex items-center gap-2 text-[#111] hover:text-[var(--accent-pink)] transition-colors font-bold group bg-white px-4 py-2 border-2 border-[#111] shadow-[2px_2px_0_0_#111] rounded hover:-translate-y-0.5"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
      </div>

      <SiteBanner banner={banners.top} variant="top" />

      <div className="brutal-card mb-8">
        {/* Large Image */}
        <div className="relative w-full bg-[#EAEAEA] border-b-2 border-[var(--border-color)] z-10">
          <img 
            src={post.image_url} 
            alt={post.title} 
            className="w-full h-auto max-h-[80vh] object-contain mx-auto"
            loading="lazy"
          />
          
          {/* Header Overlay */}
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start">
             <span className="brutal-badge text-sm">{post.category}</span>
          </div>
        </div>

        <div className="p-6 md:p-8 relative z-10 bg-[var(--surface)]">
          {/* Creator & Title */}
          <div className="flex justify-between items-start mb-6 border-b-2 border-[var(--border-color)] pb-6">
             <div>
                <h1 className="text-3xl font-bold text-[#111] mb-3">{post.title || "Untitled Prompt"}</h1>
                <div className="flex items-center gap-2">
                   {post.creator_url ? (
                     <a href={post.creator_url} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#111] bg-white px-2 py-1 rounded border-2 border-[var(--border-color)] shadow-[2px_2px_0_0_#111] hover:bg-[var(--accent-cyan)] flex items-center gap-1 transition-colors">
                       <User size={14} />
                       {post.creator} <ExternalLink size={12} />
                     </a>
                   ) : (
                     <span className="text-sm font-bold text-[#111] bg-white px-2 py-1 rounded border-2 border-[var(--border-color)] shadow-[2px_2px_0_0_#111] flex items-center gap-1">
                       <User size={14} />
                       {post.creator}
                     </span>
                   )}
                </div>
             </div>
             
             {/* Stats Actions */}
             <div className="flex gap-4">
                <button 
                  onClick={handleLike}
                  disabled={isLiked}
                  className={`flex flex-col items-center gap-1 p-2 rounded border-2 border-[var(--border-color)] shadow-[2px_2px_0_0_#111] transition-colors ${isLiked ? 'text-[var(--accent-pink)] bg-white' : 'text-[#111] bg-white hover:bg-[var(--accent-pink)] hover:text-white'}`}
                >
                  <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                  <span className="text-xs font-bold">{likes}</span>
                </button>
                <div className="flex flex-col items-center gap-1 text-[#111] bg-[var(--accent-cyan)] p-2 rounded border-2 border-[var(--border-color)] shadow-[2px_2px_0_0_#111]">
                  <Sparkles size={24} />
                  <span className="text-xs font-bold">{uses}</span>
                </div>
             </div>
          </div>

          {/* Prompt Section */}
          <div className="relative prompt-box p-6 group">
             <h3 className="text-[#111] text-sm font-bold uppercase tracking-wider mb-3">Prompt</h3>
             <p className="text-[var(--text-primary)] leading-relaxed font-medium text-base md:text-lg mb-6 whitespace-pre-wrap select-text">
                {post.prompt}
             </p>
             
             <div className="flex flex-col md:flex-row gap-3">
               <button 
                 onClick={handleCopy}
                 className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded font-bold transition-all border-2 border-[var(--border-color)] shadow-[3px_3px_0_0_#111] hover:-translate-y-1 active:translate-y-0 active:shadow-none ${
                   copied 
                   ? 'bg-[var(--accent-yellow)] text-[#111]' 
                   : 'bg-[var(--accent-cyan)] text-[#111] hover:bg-[var(--accent-pink)] hover:text-white'
                 }`}
               >
                 {copied ? <Check size={18} /> : <Copy size={18} />}
                 {copied ? 'Copied to Clipboard' : 'Copy Prompt'}
               </button>
               
               <button 
                 onClick={handleShare}
                 className="flex items-center justify-center gap-2 px-6 py-3 rounded font-bold transition-all bg-white hover:bg-[var(--accent-yellow)] text-[#111] border-2 border-[var(--border-color)] shadow-[3px_3px_0_0_#111] hover:-translate-y-1 active:translate-y-0 active:shadow-none"
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
