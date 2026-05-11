
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
        className={`fixed top-0 right-0 h-full w-72 bg-[var(--surface)] border-l-4 border-[#111] shadow-[-8px_0_0_0_#111] z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 flex justify-between items-center border-b-4 border-[#111] bg-[#EAEAEA]">
          <h2 className="text-xl font-black text-[#111] uppercase tracking-wider">Menu</h2>
          <button onClick={onClose} className="text-[#111] hover:text-[var(--accent-pink)] transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-5">
          <div>
            <h3 className="text-xs uppercase text-[#111] bg-[var(--accent-cyan)] font-black mb-4 tracking-wider inline-block px-2 py-1 border-2 border-[#111] shadow-[2px_2px_0_0_#111]">Categories</h3>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`text-left px-3 py-2 border-2 border-[var(--border-color)] font-bold text-sm transition-all uppercase ${
                    activeCategory === cat 
                      ? 'bg-[var(--accent-yellow)] text-[#111] shadow-[3px_3px_0_0_#111] translate-x-[-2px] translate-y-[-2px]' 
                      : 'bg-white text-[#111] hover:bg-[#EAEAEA]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 border-t-4 border-[#111] space-y-3 bg-[#EAEAEA]">
           {!isLoggedIn ? (
             <button 
                onClick={() => { onLoginClick(); onClose(); }}
                className="flex items-center gap-3 w-full text-[#111] bg-white border-2 border-[#111] hover:bg-[var(--accent-cyan)] transition-colors p-3 font-bold uppercase shadow-[2px_2px_0_0_#111]"
             >
                <LogIn size={18} />
                <span>Login Admin</span>
             </button>
           ) : (
             <>
               <button 
                 onClick={() => { onOpenAdmin(); onClose(); }}
                 className="flex items-center gap-3 w-full text-[#111] bg-white border-2 border-[#111] hover:bg-[var(--accent-cyan)] transition-colors p-3 font-bold uppercase shadow-[2px_2px_0_0_#111]"
               >
                 <Shield size={18} className="text-[var(--accent-pink)]" />
                 <span>Admin Panel</span>
               </button>
               
               <button 
                 onClick={() => { onOpenSettings(); onClose(); }}
                 className="flex items-center gap-3 w-full text-[#111] bg-white border-2 border-[#111] hover:bg-[var(--accent-cyan)] transition-colors p-3 font-bold uppercase shadow-[2px_2px_0_0_#111]"
               >
                 <SettingsIcon size={18} />
                 <span>Settings</span>
               </button>

               <div className="h-1 bg-[#111] my-2 w-full"></div>

               <button 
                 onClick={() => { onLogoutClick(); onClose(); }}
                 className="flex items-center gap-3 w-full text-white bg-[#111] border-2 border-[#111] hover:bg-[var(--accent-pink)] transition-colors p-3 font-bold uppercase shadow-[2px_2px_0_0_#111]"
               >
                 <LogOut size={18} />
                 <span>Logout</span>
               </button>
             </>
           )}
        </div>
      </div>
    </>
  );
};

export default SidePanel;
