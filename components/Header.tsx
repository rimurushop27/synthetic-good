
import React from 'react';
import { Menu, WifiOff } from 'lucide-react';

interface HeaderProps {
  onOpenSidebar: () => void;
  onHomeClick: () => void;
  isConnected: boolean;
}

const Header: React.FC<HeaderProps> = ({ onOpenSidebar, onHomeClick, isConnected }) => {
  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-[var(--surface)] border-b-2 border-black h-16 flex items-center px-4 shadow-[0_4px_0_0_#111] transition-all">
      
      {/* Centered Title - Now Clickable */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
        <button 
            onClick={onHomeClick}
            className="flex flex-col items-center group focus:outline-none"
            aria-label="Go to Home"
        >
            <h1 className="text-xl font-black tracking-wider text-[#111] uppercase transition-colors duration-100 cursor-pointer group-hover:text-[var(--accent-pink)]">
              Synthetic Good
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-[#111] bg-[var(--accent-cyan)] font-black px-2 rounded border-2 border-[#111] tracking-[0.2em] uppercase transition-colors duration-100 shadow-[2px_2px_0_0_#111]">
                    Free Prompt
                </span>
                {!isConnected && (
                    <span className="flex items-center gap-1 text-[9px] text-[#111] bg-[var(--accent-yellow)] px-1.5 py-0.5 rounded border-2 border-[#111] font-bold">
                    <WifiOff size={10} /> Offline
                    </span>
                )}
            </div>
        </button>
      </div>
      
      {/* Right Menu Button */}
      <div className="ml-auto z-20">
        <button 
            onClick={onOpenSidebar}
            className="text-[#111] p-2 hover:bg-[var(--accent-cyan)] border-2 border-transparent hover:border-[#111] hover:shadow-[2px_2px_0_0_#111] rounded transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-none bg-white"
            aria-label="Open menu"
        >
            <Menu size={24} />
        </button>
      </div>
    </header>
  );
};

export default Header;
