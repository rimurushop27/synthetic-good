
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

  return (
    <div className="neon-card group h-full flex flex-col will-change-transform">
      {/* Top Image Section - Strict 4:5 Ratio */}
      <div className="relative w-full aspect-[4/5] bg-black overflow-hidden z-10">
        <a 
            href={`/p/${post.slug}`} 
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
                <span className="text-[9px] text-white truncate max-w-[70px]">{post.creator || 'Admin'}</span>
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

        {/* Actions Row */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
            <div className="flex gap-3">
                <button 
                    onClick={handleLike} 
                    className={`flex items-center gap-1 text-[10px] font-bold transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                >
                    <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
                    {likes}
                </button>
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                    <Sparkles size={14} className="text-[var(--neon-blue)]" />
                    {uses}
                </div>
            </div>

            <button onClick={handleShare} className="text-gray-400 hover:text-white transition-colors">
                <Share2 size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
