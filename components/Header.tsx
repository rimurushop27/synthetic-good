import React from 'react';
import { Menu, WifiOff } from 'lucide-react';

interface HeaderProps {
  onOpenSidebar: () => void;
  isConnected: boolean;
}

const Header: React.FC<HeaderProps> = ({ onOpenSidebar, isConnected }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-black/90 backdrop-blur-md border-b border-gray-800 h-14 md:h-16 flex items-center px-4 relative">
      
      {/* Centered Title */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <h1 className="text-xl font-bold tracking-wider text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Synthetic Good
        </h1>
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-neonBlue tracking-[0.3em] uppercase font-semibold">
                Free Prompt
            </span>
            {!isConnected && (
                <span className="flex items-center gap-1 text-[9px] text-red-500 bg-red-900/20 px-1.5 py-0.5 rounded border border-red-500/30">
                <WifiOff size={8} /> Offline
                </span>
            )}
        </div>
      </div>
      
      {/* Right Menu Button */}
      <div className="ml-auto">
        <button 
            onClick={onOpenSidebar}
            className="text-white hover:text-neonPurple transition-colors p-2"
            aria-label="Open menu"
        >
            <Menu size={24} className="md:w-7 md:h-7" />
        </button>
      </div>
    </header>
  );
};

export default Header;