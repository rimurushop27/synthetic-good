
import React from 'react';
import { Sparkles, ShoppingBag } from 'lucide-react';

const PromoBanner: React.FC = () => {
  return (
    <div className="w-full mb-8 neon-card group">
      
      {/* Internal Content Wrapper with z-index to sit above glow */}
      <div className="relative z-10 p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Decorative Internal Glow (Optional extra) */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--neon-blue)] opacity-10 blur-[50px] rounded-full pointer-events-none"></div>

        <div className="text-center md:text-left relative z-20">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="bg-yellow-500/10 text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-500/30 uppercase tracking-wide animate-pulse">
                Promo Terbatas 🔥
            </span>
            <span className="text-[var(--neon-blue)] text-xs font-bold flex items-center gap-1 drop-shadow-md">
                <Sparkles size={12}/> Premium Pack
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-1 tracking-tight">
            Gemini Pro 1 Tahun
          </h3>
          <p className="text-[var(--text-muted)] text-sm">
            Dapatkan akses akun premium private <span className="text-[var(--neon-blue)] font-bold">Cuma 50rb</span>.
          </p>
        </div>

        <a 
            href="https://lynk.id/rimuru_shop" 
            target="_blank" 
            rel="noreferrer"
            className="neon-button bg-black/30 hover:bg-[var(--neon-blue)] hover:text-black transition-all px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg relative z-20"
        >
            <ShoppingBag size={18} />
            Beli Sekarang
        </a>
      </div>
    </div>
  );
};

export default PromoBanner;
