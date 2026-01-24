import React from 'react';
import { Sparkles, ShoppingBag } from 'lucide-react';

const PromoBanner: React.FC = () => {
  return (
    <div className="w-full mb-4 relative group overflow-hidden rounded-2xl border border-neonPurple/30 bg-gradient-to-r from-[#1a0b35] to-[#2e1065]">
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-neonBlue/20 blur-[50px] rounded-full"></div>
      
      <div className="relative z-10 p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="bg-yellow-500/20 text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-500/30 uppercase tracking-wide animate-pulse">
                Promo Terbatas 🔥
            </span>
            <span className="text-neonBlue text-xs font-bold flex items-center gap-1">
                <Sparkles size={12}/> Premium Pack
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
            Gemini Pro 1 Tahun
          </h3>
          <p className="text-gray-300 text-sm">
            Dapatkan akses akun premium private <span className="text-green-400 font-bold">Cuma 50rb</span>.
          </p>
        </div>

        <a 
            href="https://lynk.id/rimuru_shop" 
            target="_blank" 
            rel="noreferrer"
            className="bg-white text-black hover:bg-neonBlue transition-colors px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transform hover:-translate-y-1 duration-200"
        >
            <ShoppingBag size={18} />
            Beli
        </a>
      </div>
    </div>
  );
};

export default PromoBanner;