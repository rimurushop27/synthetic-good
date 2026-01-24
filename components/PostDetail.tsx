
import React, { useState, useEffect } from 'react';
import { Copy, Heart, Check, User, Sparkles, ArrowLeft, ExternalLink } from 'lucide-react';
import { Post } from '../types';
import { incrementLike, incrementUse } from '../services/supabaseService';

interface PostDetailProps {
  post: Post;
  onBack: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, onBack }) => {
  const [likes, setLikes] = useState(post.like_count);
  const [uses, setUses] = useState(post.use_count);
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPostIds') || '[]');
    if (likedPosts.includes(post.id)) setIsLiked(true);
  }, [post.id]);

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[var(--neon-blue)] mb-6 hover:text-white transition-colors font-medium group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </button>

      <div className="neon-card">
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
            
            <button 
              onClick={handleCopy}
              className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                copied 
                ? 'bg-green-500/20 text-green-400 border border-green-500/40' 
                : 'neon-button'
              }`}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied to Clipboard' : 'Copy Prompt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
