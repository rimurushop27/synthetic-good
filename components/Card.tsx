
import React, { useState, useEffect } from 'react';
import { Copy, Heart, Sparkles, User, Share2, Check } from 'lucide-react';
import { Post } from '../types';
import { incrementLike, incrementUse } from '../services/supabaseService';

interface CardProps {
  post: Post;
  onCopyPrompt: (text: string) => void;
  onShare: (post: Post) => void;
  onImageClick?: (imageUrl: string) => void;
}

const Card: React.FC<CardProps> = ({ post, onCopyPrompt, onShare, onImageClick }) => {
  const [likes, setLikes] = useState(post.like_count);
  const [uses, setUses] = useState(post.use_count);
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPostIds') || '[]');
    if (likedPosts.includes(post.id)) {
      setIsLiked(true);
    }
  }, [post.id]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onCopyPrompt(post.prompt);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    setUses(prev => prev + 1);
    incrementUse(post.id);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isLiked) return;

    setLikes(prev => prev + 1);
    setIsLiked(true);
    const likedPosts = JSON.parse(localStorage.getItem('likedPostIds') || '[]');
    localStorage.setItem('likedPostIds', JSON.stringify([...likedPosts, post.id]));
    incrementLike(post.id);
  };

  const handleShare = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onShare(post);
  };

  const handleCreatorClick = (e: React.MouseEvent) => {
      e.stopPropagation();
  };

  // Determine URL path based on primary_tag or fallback to legacy /p/
  const tagSlug = post.primary_tag ? post.primary_tag.replace(/\s+/g, '-') : 'p';
  const postUrl = `/${tagSlug}/${post.slug}`;

  return (
    <div className="neon-card group h-full flex flex-col will-change-transform">
      {/* Top Image Section - Strict 4:5 Ratio */}
      <div className="relative w-full aspect-[4/5] bg-black overflow-hidden z-10">
        <a 
            href={postUrl} 
            className="block w-full h-full cursor-zoom-in"
            onClick={(e) => {
                if(onImageClick) {
                    e.preventDefault();
                    onImageClick(post.image_url);
                }
            }}
        >
            <img 
                src={post.image_url} 
                alt={post.title || "AI Prompt"} 
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                style={{ filter: 'none' }} /* Force no filter */
                loading="lazy" 
                decoding="async"
                fetchPriority="low"
            />
        </a>

        {/* Floating Header */}
        <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-start z-20 pointer-events-none">
            <span className="bg-black/60 backdrop-blur-sm text-[var(--neon-blue)] border border-[var(--neon-blue-soft)] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                {post.category}
            </span>
            <a 
                href={post.creator_url} 
                target="_blank" 
                rel="noreferrer"
                onClick={handleCreatorClick}
                className="bg-black/60 backdrop-blur-sm flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-white/10 hover:border-[var(--neon-purple)] transition-colors pointer-events-auto cursor-pointer"
            >
                <User size={9} className="text-[var(--neon-purple)]" />
                <span className="text-sm text-white truncate max-w-[70px]">{post.creator || 'Admin'}</span>
            </a>
        </div>
      </div>

      {/* Bottom Content - Transparent BG to let Neon Card gradient show */}
      <div className="p-3 flex flex-col gap-2 flex-grow relative z-10 bg-transparent">
        
        {/* Prompt Box */}
        <div className="prompt-box group/prompt">
            <p className="line-clamp-3 pr-6 text-[var(--text-muted)] font-light text-[11px] leading-relaxed">
                {post.prompt}
            </p>
            <button 
                onClick={handleCopy}
                className="copy-btn-inner"
                title="Copy Prompt"
            >
                {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
        </div>

        {/* Actions Row (Like, Use, Tags, Share) */}
        <div className="flex items-center mt-auto pt-2 border-t border-white/10 gap-3 text-[10px]">
            {/* Like */}
            <button 
                onClick={handleLike} 
                className={`flex items-center gap-1 font-bold transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            >
                <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
                {likes}
            </button>
            
            {/* Use */}
            <div className="flex items-center gap-1 font-bold text-gray-400">
                <Sparkles size={14} className="text-[var(--neon-blue)]" />
                {uses}
            </div>

            {/* Tags (Middle) */}
            <div className="flex-1 flex items-center gap-1 overflow-hidden min-w-0">
                {post.tags && post.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap truncate max-w-[60px]">
                        #{tag}
                    </span>
                ))}
            </div>

            {/* Share */}
            <button onClick={handleShare} className="text-gray-400 hover:text-white transition-colors shrink-0">
                <Share2 size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
