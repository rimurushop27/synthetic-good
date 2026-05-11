import React, { useState, useEffect } from 'react';
import { SiteBanner } from '../types';
import { getSiteBanners, updateSiteBanner } from '../services/supabaseService';
import { Save } from 'lucide-react';

const DEFAULT_BANNER: SiteBanner = {
  id: '',
  placement: 'top',
  is_active: false,
  badge_text: '',
  pack_label: '',
  title: '',
  subtitle: '',
  button_text: '',
  button_url: ''
};

interface AdminBannersProps {
  onUpdate: () => void;
}

const AdminBanners: React.FC<AdminBannersProps> = ({ onUpdate }) => {
  const [topBanner, setTopBanner] = useState<SiteBanner>({ ...DEFAULT_BANNER, id: 'banner_top', placement: 'top' });
  const [bottomBanner, setBottomBanner] = useState<SiteBanner>({ ...DEFAULT_BANNER, id: 'banner_bottom', placement: 'bottom' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    const { top, bottom } = await getSiteBanners();
    if (top) setTopBanner(top);
    if (bottom) setBottomBanner(bottom);
    setLoading(false);
  };

  const handleSave = async (banner: SiteBanner, type: 'top' | 'bottom') => {
    try {
      setStatus(`Saving ${type} banner...`);
      await updateSiteBanner(banner);
      setStatus(`${type.charAt(0).toUpperCase() + type.slice(1)} banner saved successfully!`);
      onUpdate();
      setTimeout(() => setStatus(''), 3000);
    } catch (err: any) {
      setStatus(`Error saving ${type} banner: ${err.message}`);
    }
  };

  const renderBannerForm = (banner: SiteBanner, setBanner: React.Dispatch<React.SetStateAction<SiteBanner>>, type: 'top' | 'bottom') => {
    return (
      <div className="brutal-card p-6 mb-6 bg-[var(--surface)]">
        <div className="flex justify-between items-center mb-6 border-b-2 border-[#111] pb-4">
          <h3 className="text-xl font-black text-[#111] capitalize uppercase">{type} Banner</h3>
          <div className="flex items-center gap-2 bg-[#EAEAEA] px-3 py-1 border-2 border-[#111] shadow-[2px_2px_0_0_#111]">
            <label className="text-xs font-bold uppercase text-[#111] cursor-pointer">Active</label>
            <input 
              type="checkbox" 
              checked={banner.is_active}
              onChange={(e) => setBanner({ ...banner, is_active: e.target.checked })}
              className="w-4 h-4 accent-[#111] cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs text-[#111] font-bold uppercase block mb-1">Badge Text</label>
            <input 
              className="settings-input" 
              value={banner.badge_text} 
              onChange={(e) => setBanner({ ...banner, badge_text: e.target.value })}
              placeholder="e.g. Promo Terbatas 🔥"
            />
          </div>
          <div>
            <label className="text-xs text-[#111] font-bold uppercase block mb-1">Pack Label</label>
            <input 
              className="settings-input" 
              value={banner.pack_label} 
              onChange={(e) => setBanner({ ...banner, pack_label: e.target.value })}
              placeholder="e.g. Premium Pack"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-[#111] font-bold uppercase block mb-1">Title</label>
            <input 
              className="settings-input" 
              value={banner.title} 
              onChange={(e) => setBanner({ ...banner, title: e.target.value })}
              placeholder="e.g. Gemini Pro 1 Tahun"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-[#111] font-bold uppercase block mb-1">Subtitle</label>
            <input 
              className="settings-input" 
              value={banner.subtitle} 
              onChange={(e) => setBanner({ ...banner, subtitle: e.target.value })}
              placeholder="e.g. Dapatkan akses akun premium private Cuma 50rb."
            />
          </div>
          <div>
            <label className="text-xs text-[#111] font-bold uppercase block mb-1">Button Text</label>
            <input 
              className="settings-input" 
              value={banner.button_text} 
              onChange={(e) => setBanner({ ...banner, button_text: e.target.value })}
              placeholder="e.g. Beli Sekarang"
            />
          </div>
          <div>
            <label className="text-xs text-[#111] font-bold uppercase block mb-1">Button URL</label>
            <input 
              className="settings-input" 
              value={banner.button_url} 
              onChange={(e) => setBanner({ ...banner, button_url: e.target.value })}
              placeholder="e.g. http://t.me/synthetic_good"
            />
          </div>
        </div>

        <button 
          onClick={() => handleSave(banner, type)}
          className="action-btn w-full flex items-center justify-center gap-2 py-3"
        >
          <Save size={18} /> Save {type} Banner
        </button>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center text-gray-500 py-8">Loading banners...</div>;
  }

  return (
    <div>
      {status && <div className="text-sm text-center text-[#111] bg-[var(--accent-yellow)] border-2 border-[#111] shadow-[2px_2px_0_0_#111] font-bold mb-4 p-2">{status}</div>}
      {renderBannerForm(topBanner, setTopBanner, 'top')}
      {renderBannerForm(bottomBanner, setBottomBanner, 'bottom')}
    </div>
  );
};

export default AdminBanners;
