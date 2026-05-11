
import React from 'react';
import { Sparkles, ShoppingBag } from 'lucide-react';

const PromoBanner: React.FC = () => {
  return (
    <div className="w-full mb-8 brutal-card group bg-[var(--surface)]">
      
      {/* Internal Content Wrapper */}
      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-[#EAEAEA]">
        
        <div className="text-center md:text-left relative z-20">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
            <span className="bg-[#111] text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-[2px_2px_0_0_#111]">
                Promo Terbatas 🔥
            </span>
            <span className="text-[#111] text-xs font-black uppercase tracking-wider flex items-center gap-1 border-2 border-[#111] bg-white px-2 py-1 rounded shadow-[2px_2px_0_0_#111]">
                <Sparkles size={12}/> Premium Pack
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-[#111] mb-2 tracking-tight uppercase">
            Gemini Pro 1 Tahun
          </h3>
          <p className="text-[#111] text-sm font-medium">
            Dapatkan akses akun premium private <span className="bg-[var(--accent-yellow)] px-1 border-2 border-[#111] font-black uppercase shadow-[1px_1px_0_0_#111]">Cuma 50rb</span>.
          </p>
        </div>

        <a 
            href="https://lynk.id/rimuru_shop" 
            target="_blank" 
            rel="noreferrer"
            className="w-full md:w-auto action-btn px-8 py-3 bg-[var(--accent-cyan)] text-[#111] font-black tracking-widest flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#111] active:translate-y-0 active:translate-x-0 active:shadow-none"
        >
            <ShoppingBag size={18} />
            Beli Sekarang
        </a>
      </div>
    </div>
  );
};

export default PromoBanner;
