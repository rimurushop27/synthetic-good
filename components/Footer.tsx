
import React from 'react';
import { Instagram, Facebook, MessageCircle, Send, Sparkles, ExternalLink } from 'lucide-react';
import { getSettings } from '../services/supabaseService';

// Custom TikTok icon
const TikTokIcon = ({ size = 20, className = "" }: {size?: number, className?: string}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
  </svg>
);

const Footer: React.FC = () => {
  const settings = getSettings();
  const { socials } = settings;

  return (
    <footer className="bg-black border-t border-gray-900 pt-8 pb-8 px-4 mt-auto">
      
      {/* NEW ENGLISH CTA BANNER */}
      <div className="container mx-auto max-w-4xl mb-10">
        <div className="w-full relative group overflow-hidden rounded-2xl border border-neonPurple/30 bg-gradient-to-r from-[#2e1065] to-[#1a0b35]">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 blur-[50px] rounded-full"></div>
            
            <div className="relative z-10 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <span className="bg-red-500/20 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30 uppercase tracking-wide animate-pulse">
                            LIMITED OFFER 🔥
                        </span>
                        <span className="text-purple-300 text-xs font-bold flex items-center gap-1">
                            <Sparkles size={12}/> Premium Pack
                        </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                        Gemini Pro 1 Year
                    </h3>
                    <p className="text-gray-300 text-sm">
                        Private premium access — only $10.
                    </p>
                </div>

                <a 
                    href="https://t.me/rimuru_shop27" 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-white text-black hover:bg-neonPurple hover:text-white transition-colors px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transform hover:-translate-y-1 duration-200"
                >
                    Buy Now <ExternalLink size={16} />
                </a>
            </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
        
        <div>
           <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Follow Us</h3>
           <div className="flex gap-6 items-center justify-center md:justify-start">
            <a href={socials.instagram} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#E1306C] transition-transform hover:scale-110"><Instagram size={24} /></a>
            <a href={socials.facebook} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#1877F2] transition-transform hover:scale-110"><Facebook size={24} /></a>
            <a href={socials.tiktok} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-transform hover:scale-110"><TikTokIcon size={24} /></a>
           </div>
        </div>

        <div>
           <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Join Channel</h3>
           <div className="flex gap-6 items-center justify-center md:justify-start">
            <a href={socials.whatsapp} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#25D366] transition-transform hover:scale-110"><MessageCircle size={24} /></a>
            <a href={socials.telegram} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0088cc] transition-transform hover:scale-110"><Send size={24} /></a>
           </div>
        </div>
      </div>

      <div className="text-center mt-12 pt-8 border-t border-gray-900">
        <p className="text-xs text-gray-600">Synthetic Good © 2025. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
