import React from 'react';
import { Instagram, Facebook, MessageCircle, Send } from 'lucide-react';
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
    <footer className="bg-black border-t border-gray-900 pt-12 pb-8 px-4 mt-auto">
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