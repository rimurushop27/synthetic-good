
import React from 'react';
import { Menu, WifiOff } from 'lucide-react';

interface HeaderProps {
  onOpenSidebar: () => void;
  onHomeClick: () => void;
  isConnected: boolean;
}

const Header: React.FC<HeaderProps> = ({ onOpenSidebar, onHomeClick, isConnected }) => {
  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10 h-16 flex items-center px-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all">
      
      {/* Centered Title - Now Clickable */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
        <button 
            onClick={onHomeClick}
            className="flex flex-col items-center group focus:outline-none"
            aria-label="Go to Home"
        >
            <h1 className="text-xl font-bold tracking-wider text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-400 group-hover:text-neonBlue transition-colors duration-300 cursor-pointer">
              Synthetic Good
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-neonBlue tracking-[0.3em] uppercase font-semibold group-hover:text-white transition-colors duration-300 shadow-cyan-500/50">
                    Free Prompt
                </span>
                {!isConnected && (
                    <span className="flex items-center gap-1 text-[9px] text-red-500 bg-red-900/20 px-1.5 py-0.5 rounded border border-red-500/30">
                    <WifiOff size={8} /> Offline
                    </span>
                )}
            </div>
        </button>
      </div>
      
      {/* Right Menu Button */}
      <div className="ml-auto z-20">
        <button 
            onClick={onOpenSidebar}
            className="text-gray-300 hover:text-neonBlue transition-colors p-2 active:scale-95 hover:bg-white/5 rounded-full"
            aria-label="Open menu"
        >
            <Menu size={26} />
        </button>
      </div>
    </header>
  );
};

export default Header;
