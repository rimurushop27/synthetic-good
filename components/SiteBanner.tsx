import React from 'react';
import { SiteBanner as SiteBannerType } from '../types';
import { Zap } from 'lucide-react';

interface SiteBannerProps {
  banner: SiteBannerType | null;
  variant?: 'top' | 'bottom';
}

const SiteBanner: React.FC<SiteBannerProps> = ({ banner, variant = 'top' }) => {
  if (!banner || !banner.is_active) return null;

  return (
    <div className="neon-card p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-neonPurple/30 bg-neonPurple/5">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="h-12 w-12 rounded-xl bg-neonPurple/20 flex items-center justify-center flex-shrink-0">
          <Zap className="text-neonPurple" size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-neonPurple/20 text-neonPurple uppercase tracking-wider">
              {banner.badge_text}
            </span>
            <span className="text-xs text-gray-400">{banner.pack_label}</span>
          </div>
          <h3 className="font-bold text-lg text-white leading-tight">{banner.title}</h3>
          <p className="text-sm text-gray-400">{banner.subtitle}</p>
        </div>
      </div>
      <a 
        href={banner.button_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full md:w-auto px-6 py-3 rounded-lg bg-neonPurple hover:bg-purple-600 text-white font-semibold transition-colors text-center whitespace-nowrap"
      >
        {banner.button_text}
      </a>
    </div>
  );
};

export default SiteBanner;
