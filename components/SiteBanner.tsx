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
    <div className="brutal-card p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--accent-yellow)]">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="h-12 w-12 rounded bg-white border-2 border-[var(--border-color)] flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0_0_#111]">
          <Zap className="text-[#111]" size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#111] text-white uppercase tracking-wider">
              {banner.badge_text}
            </span>
            <span className="text-xs font-bold text-[#111]">{banner.pack_label}</span>
          </div>
          <h3 className="font-black text-xl text-[#111] leading-tight uppercase">{banner.title}</h3>
          <p className="text-sm font-medium text-[#111]">{banner.subtitle}</p>
        </div>
      </div>
      <a 
        href={banner.button_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full md:w-auto px-6 py-3 rounded bg-white hover:bg-[var(--accent-cyan)] text-[#111] font-black uppercase text-center whitespace-nowrap transition-colors border-2 border-[var(--border-color)] shadow-[4px_4px_0_0_#111] hover:-translate-y-1 active:translate-y-0 active:shadow-none"
      >
        {banner.button_text}
      </a>
    </div>
  );
};

export default SiteBanner;
