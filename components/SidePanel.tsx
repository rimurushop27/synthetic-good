import React, { useEffect, useRef } from 'react';
import { X, Settings as SettingsIcon, Shield, LogIn, LogOut } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { CategoryType } from '../types';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ 
  isOpen, 
  onClose, 
  activeCategory, 
  onSelectCategory,
  isLoggedIn,
  onLoginClick,
  onLogoutClick,
  onOpenSettings,
  onOpenAdmin 
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <div 
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-72 bg-[#0b0b14] border-l border-gray-800 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Menu</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-5">
          <div className="mb-8">
            <h3 className="text-xs uppercase text-gray-500 font-bold mb-4 tracking-wider">Navigation</h3>
            <button onClick={() => { onSelectCategory('All'); onClose(); }} className="w-full text-left py-2 text-gray-300 hover:text-white">Home</button>
            <button onClick={() => { onClose(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="w-full text-left py-2 text-gray-300 hover:text-white">Most Viral</button>
            <button onClick={() => { onClose(); window.scrollTo({top: 400, behavior: 'smooth'}); }} className="w-full text-left py-2 text-gray-300 hover:text-white">New Update</button>
          </div>

          <div>
            <h3 className="text-xs uppercase text-gray-500 font-bold mb-4 tracking-wider">Categories</h3>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`text-left px-3 py-2 rounded-md font-medium text-sm transition-all ${
                    activeCategory === cat 
                      ? 'bg-neonPurple/20 text-neonPurple border border-neonPurple/30' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-800 space-y-3">
           {!isLoggedIn ? (
             <button 
                onClick={() => { onLoginClick(); onClose(); }}
                className="flex items-center gap-3 w-full text-gray-400 hover:text-neonBlue transition-colors p-2 rounded hover:bg-white/5"
             >
                <LogIn size={18} />
                <span className="text-sm font-medium">Login Admin</span>
             </button>
           ) : (
             <>
               <button 
                 onClick={() => { onOpenAdmin(); onClose(); }}
                 className="flex items-center gap-3 w-full text-gray-400 hover:text-white transition-colors p-2 rounded hover:bg-white/5"
               >
                 <Shield size={18} className="text-neonPurple" />
                 <span className="text-sm font-medium">Admin Panel</span>
               </button>
               
               <button 
                 onClick={() => { onOpenSettings(); onClose(); }}
                 className="flex items-center gap-3 w-full text-gray-400 hover:text-white transition-colors p-2 rounded hover:bg-white/5"
               >
                 <SettingsIcon size={18} />
                 <span className="text-sm font-medium">Settings</span>
               </button>

               <div className="h-px bg-gray-800 my-2"></div>

               <button 
                 onClick={() => { onLogoutClick(); onClose(); }}
                 className="flex items-center gap-3 w-full text-red-400 hover:text-red-300 transition-colors p-2 rounded hover:bg-white/5"
               >
                 <LogOut size={18} />
                 <span className="text-sm font-medium">Logout</span>
               </button>
             </>
           )}
        </div>
      </div>
    </>
  );
};

export default SidePanel;