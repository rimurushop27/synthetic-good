
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
    <div className="brutal-card group h-full flex flex-col bg-[var(--surface)] relative z-0">
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
                fetchpriority="low"
            />
        </a>

        {/* Floating Header */}
        <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start z-20 pointer-events-none">
            <span className="brutal-badge text-[10px]">
                {post.category}
            </span>
            <a 
                href={post.creator_url} 
                target="_blank" 
                rel="noreferrer"
                onClick={handleCreatorClick}
                className="bg-white flex items-center gap-1 px-2 py-1 rounded border-2 border-[var(--border-color)] hover:bg-[var(--accent-cyan)] shadow-[2px_2px_0_0_var(--shadow-color)] transition-colors pointer-events-auto cursor-pointer text-[#111]"
            >
                <User size={10} className="text-[#111]" />
                <span className="text-xs font-bold truncate max-w-[80px]">{post.creator || 'Admin'}</span>
            </a>
        </div>
      </div>

      {/* Bottom Content */}
      <div className="p-3 flex flex-col gap-3 flex-grow relative z-10 bg-[var(--surface)]">
        
        {/* Prompt Box */}
        <div className="prompt-box group/prompt">
            <p className="line-clamp-3 pr-8 text-[var(--text-primary)] font-medium text-xs leading-relaxed">
                {post.prompt}
            </p>
            <button 
                onClick={handleCopy}
                className="copy-btn-inner flex items-center justify-center p-2"
                title="Copy Prompt"
            >
                {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
        </div>

        {/* Actions Row (Like, Use, Tags, Share) */}
        <div className="flex items-center mt-auto pt-2 gap-3 text-xs font-bold border-t-2 border-[var(--border-color)]">
            {/* Like */}
            <button 
                onClick={handleLike} 
                className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-[var(--accent-pink)]' : 'text-[#111] hover:text-[var(--accent-pink)]'}`}
            >
                <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                {likes}
            </button>
            
            {/* Use */}
            <div className="flex items-center gap-1 text-[#111]">
                <Sparkles size={16} className="text-[var(--accent-cyan)]" />
                {uses}
            </div>

            {/* Tags (Middle) */}
            <div className="flex-1 flex items-center gap-1 overflow-hidden min-w-0">
                {post.tags && post.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="bg-white text-[#111] px-1.5 py-0.5 rounded border-2 border-[var(--border-color)] whitespace-nowrap truncate max-w-[70px] text-[9px] shadow-[1px_1px_0_0_#111]">
                        #{tag}
                    </span>
                ))}
            </div>

            {/* Share */}
            <button onClick={handleShare} className="text-[#111] hover:text-[var(--accent-cyan)] transition-colors shrink-0 p-1">
                <Share2 size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
