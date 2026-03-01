
import React, { useState, useEffect } from 'react';
import { Post, CategoryType, AppSettings, DEFAULT_SETTINGS, SiteBanner as SiteBannerType } from './types';
import { 
  getViralPosts, 
  getNewPosts, 
  getPostBySlug, 
  getSupabase, 
  resetSupabase, 
  saveSettings, 
  getSettings,
  signInAdmin,
  signOutAdmin,
  checkSession,
  uploadImage,
  createPost,
  generateSlug,
  getAdminPosts,
  deletePost,
  getSiteBanners,
  updateSiteBanner
} from './services/supabaseService';
import Header from './components/Header';
import SidePanel from './components/SidePanel';
import Footer from './components/Footer';
import Card from './components/Card';
import PostDetail from './components/PostDetail';
import Pagination from './components/Pagination';
import SiteBanner from './components/SiteBanner';
import { Zap, Flame, X, Coffee, AlertCircle, Upload, Check, Lock, LogIn, Trash2, LayoutDashboard, PlusSquare, ArrowLeft, Clock, Tag, User, Save, Megaphone } from 'lucide-react';
import { CATEGORIES } from './constants';

const DONATION_LINK = "https://ko-fi.com/syntheticgood";

// Skeleton Components
const CardSkeleton = () => (
    <div className="neon-card h-full flex flex-col overflow-hidden border border-white/5">
        <div className="w-full aspect-[4/5] skeleton-loader"></div>
        <div className="p-3 flex flex-col gap-2 flex-grow">
            <div className="h-20 rounded skeleton-loader w-full opacity-50"></div>
            <div className="flex justify-between mt-auto pt-2">
                <div className="h-4 w-12 skeleton-loader rounded opacity-30"></div>
                <div className="h-4 w-4 skeleton-loader rounded-full opacity-30"></div>
            </div>
        </div>
    </div>
);

const BannerForm = ({ title, banner, onSave }: { title: string, banner: SiteBannerType | null, onSave: (b: SiteBannerType) => void }) => {
    const [form, setForm] = useState<SiteBannerType>(banner || {
        id: title === 'Top Banner' ? 'banner_top' : 'banner_bottom',
        placement: title === 'Top Banner' ? 'top' : 'bottom',
        is_active: false,
        badge_text: '',
        pack_label: '',
        title: '',
        subtitle: '',
        button_text: '',
        button_url: ''
    });

    useEffect(() => {
        if (banner) setForm(banner);
    }, [banner]);

    const handleChange = (field: keyof SiteBannerType, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-3">
            <h3 className="text-[var(--neon-blue)] font-bold uppercase text-sm mb-2 flex items-center gap-2">
                {title === 'Top Banner' ? <Zap size={14}/> : <Megaphone size={14}/>} {title}
            </h3>
            
            <div className="flex items-center gap-2 mb-2 bg-black/20 p-2 rounded border border-white/5">
                <input 
                    type="checkbox" 
                    checked={form.is_active} 
                    onChange={e => handleChange('is_active', e.target.checked)}
                    className="w-4 h-4 accent-[var(--neon-blue)] cursor-pointer"
                    id={`active-${title}`}
                />
                <label htmlFor={`active-${title}`} className="text-xs text-white font-bold cursor-pointer select-none">Enable Banner</label>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Badge Text</label>
                    <input className="settings-input text-xs py-1.5" value={form.badge_text || ''} onChange={e => handleChange('badge_text', e.target.value)} placeholder="e.g. NEW" />
                </div>
                <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Pack Label</label>
                    <input className="settings-input text-xs py-1.5" value={form.pack_label || ''} onChange={e => handleChange('pack_label', e.target.value)} placeholder="e.g. Premium Pack" />
                </div>
            </div>

            <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Title</label>
                <input className="settings-input text-xs py-1.5" value={form.title || ''} onChange={e => handleChange('title', e.target.value)} placeholder="Banner Title" />
            </div>

            <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Subtitle</label>
                <input className="settings-input text-xs py-1.5" value={form.subtitle || ''} onChange={e => handleChange('subtitle', e.target.value)} placeholder="Banner Subtitle" />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Button Text</label>
                    <input className="settings-input text-xs py-1.5" value={form.button_text || ''} onChange={e => handleChange('button_text', e.target.value)} placeholder="e.g. Buy Now" />
                </div>
                <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Button URL</label>
                    <input className="settings-input text-xs py-1.5" value={form.button_url || ''} onChange={e => handleChange('button_url', e.target.value)} placeholder="https://..." />
                </div>
            </div>

            <button type="submit" className="bg-white/10 hover:bg-[var(--neon-blue)] hover:text-black text-white text-xs font-bold py-2 px-4 rounded transition-colors w-full flex items-center justify-center gap-2">
                <Save size={14}/> Save {title}
            </button>
        </form>
    );
};

const App: React.FC = () => {
  // --- Global State ---
  const [view, setView] = useState<'home' | 'detail'>('home');
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- Data State ---
  const [viralPosts, setViralPosts] = useState<Post[]>([]);
  const [newPosts, setNewPosts] = useState<Post[]>([]);
  const [totalNewCount, setTotalNewCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- Modals State ---
  const [showSettings, setShowSettings] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Banners
  const [banners, setBanners] = useState<{ top: SiteBannerType | null, bottom: SiteBannerType | null }>({ top: null, bottom: null });

  // --- Admin State ---
  const [settingsForm, setSettingsForm] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [adminTab, setAdminTab] = useState<'create' | 'manage' | 'banners'>('create');
  const [adminPosts, setAdminPosts] = useState<Post[]>([]);
  const [isDeleting, setIsDeleting] = useState('');
  
  // Admin Upload Form
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [uploadPrompt, setUploadPrompt] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadPrimaryTag, setUploadPrimaryTag] = useState('gemini prompt'); // Default
  
  // Creator State
  const [uploadCreatorMode, setUploadCreatorMode] = useState<'admin' | 'manual'>('admin');
  const [uploadCreator, setUploadCreator] = useState(DEFAULT_SETTINGS.defaultCreator);
  const [uploadCreatorUrl, setUploadCreatorUrl] = useState(DEFAULT_SETTINGS.defaultCreatorUrl);
  
  const [uploadStatus, setUploadStatus] = useState('');
  
  // Admin Scheduling
  const [postStatus, setPostStatus] = useState<'published' | 'draft'>('published');
  const [isScheduled, setIsScheduled] = useState(false);
  const [publishDate, setPublishDate] = useState('');

  // --- Initialization ---
  useEffect(() => {
    const saved = getSettings();
    setSettingsForm(saved);
    
    const sb = getSupabase();
    if (sb) {
      setIsConnected(true);
      fetchData();
      checkSession().then(session => setIsLoggedIn(!!session));
    } else {
      console.warn("Supabase not configured. Running in offline mode.");
      setIsConnected(false);
    }
    
    // --- Routing Handler ---
    const handleRouting = () => {
        const path = window.location.pathname;
        let slug = null;

        // Legacy /p/ route
        if (path.startsWith('/p/')) {
            slug = path.split('/p/')[1];
        } 
        // New Tag Routes
        else if (path.startsWith('/gemini-prompt/') || path.startsWith('/chatgpt-prompt/')) {
             const parts = path.split('/');
             if (parts.length >= 3) {
                 slug = parts[2];
             }
        }

        const querySlug = new URLSearchParams(window.location.search).get('slug');
        const finalSlug = slug || querySlug;

        if (finalSlug && finalSlug !== 'null' && finalSlug !== '') {
            // Normalize URL based on detected slug if needed, but for now just open
            handleOpenSlug(finalSlug, false); 
        } else {
            setView('home');
        }
    };
    
    handleRouting();
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);

  }, []);

  const fetchData = async () => {
    setLoading(true);
    const v = await getViralPosts();
    setViralPosts(v);
    
    const n = await getNewPosts(1, 10, 'All');
    setNewPosts(n.data);
    setTotalNewCount(n.count);

    const b = await getSiteBanners();
    setBanners(b);

    setLoading(false);
  };

  // --- Handlers ---

  const handleOpenSlug = async (slug: string, pushState = true) => {
    const p = await getPostBySlug(slug);
    
    if (p) {
      setCurrentPost(p);
      setView('detail');
      if (pushState) {
        // Construct pretty URL based on tag
        const tagSlug = p.primary_tag ? p.primary_tag.replace(/\s+/g, '-') : 'p';
        const newUrl = `/${tagSlug}/${slug}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    } else {
      // 404 Logic: Set view to detail but currentPost to null to trigger 404 UI in PostDetail
      setCurrentPost(null);
      setView('detail');
    }
  };

  const handleGoHome = () => {
    window.history.pushState(null, '', '/');
    setView('home');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  // Helper for Auto-Scroll with Highlight
  const scrollToContent = () => {
    setTimeout(() => {
      const el = document.getElementById('latest-updates');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Add temporary highlight class
        el.classList.add('highlight-active');
        setTimeout(() => el.classList.remove('highlight-active'), 600);
      }
    }, 100);
  };

  const handleCategoryChange = async (cat: CategoryType) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    setIsSidebarOpen(false);
    
    // UX: Auto-scroll to content grid
    if (view !== 'home') {
      handleGoHome();
      scrollToContent(); // Will run after view change due to timeout inside
    } else {
      scrollToContent();
    }

    setLoading(true);
    const n = await getNewPosts(1, 10, cat);
    setNewPosts(n.data);
    setTotalNewCount(n.count);
    setLoading(false);
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    setLoading(true);
    const n = await getNewPosts(page, 10, activeCategory);
    setNewPosts(n.data);
    setLoading(false);
    scrollToContent(); // Scroll back to top of list on page change too
  };

  const handleSaveSettings = () => {
    saveSettings(settingsForm);
    resetSupabase();
    const sb = getSupabase();
    if (sb) {
      setIsConnected(true);
      fetchData();
      setShowSettings(false);
      checkSession().then(s => setIsLoggedIn(!!s));
    } else {
      alert("Invalid Config. Connection Failed.");
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = (document.getElementById('admin-email') as HTMLInputElement).value;
    const pass = (document.getElementById('admin-pass') as HTMLInputElement).value;
    try {
        setUploadStatus("Logging in...");
        const session = await signInAdmin(email, pass);
        if (session) {
            setIsLoggedIn(true);
            setShowLoginModal(false);
            setUploadStatus("");
        }
    } catch (err: any) {
        setUploadStatus("Error: " + err.message);
    }
  };

  const handleLogout = async () => {
      await signOutAdmin();
      setIsLoggedIn(false);
      window.location.reload();
  };

  const handleOpenAdmin = () => {
      if (!isLoggedIn) return;
      // Use defaults
      setUploadStatus("");
      setAdminTab('create');
      setPostStatus('published');
      setIsScheduled(false);
      setPublishDate('');
      
      // Reset Creator to Admin Default
      setUploadCreatorMode('admin');
      setUploadCreator(settingsForm.defaultCreator);
      setUploadCreatorUrl(settingsForm.defaultCreatorUrl);
      
      setShowAdminPanel(true);
  };

  const fetchAdminPosts = async () => {
      try {
          const p = await getAdminPosts(50);
          setAdminPosts(p);
      } catch(e) { console.error(e); }
  };

  useEffect(() => {
      if (showAdminPanel && adminTab === 'manage') {
          fetchAdminPosts();
      }
  }, [showAdminPanel, adminTab]);

  const handleSaveBanner = async (banner: SiteBannerType) => {
      try {
          setUploadStatus("Saving Banner...");
          await updateSiteBanner(banner);
          setUploadStatus("Banner Saved!");
          triggerToast("Banner Updated");
          fetchData(); // Refresh global state
          setTimeout(() => setUploadStatus(""), 2000);
      } catch (err: any) {
          console.error(err);
          setUploadStatus("Error: " + err.message);
      }
  };

  const handlePublish = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!uploadFile || !uploadPrompt || !uploadCategory || !uploadPrimaryTag) {
          alert("Image, Prompt, Category and Tag are required");
          return;
      }
      
      // Validation for Manual Creator
      if (uploadCreatorMode === 'manual' && (!uploadCreator || !uploadCreatorUrl)) {
          alert("Creator Name and URL are required for Manual mode");
          return;
      }

      if (isScheduled && !publishDate) {
          alert("Please select a date for scheduled publish");
          return;
      }

      try {
          setUploadStatus("Uploading Image...");
          const url = await uploadImage(uploadFile);
          
          setUploadStatus("Saving Post...");
          const slug = generateSlug();
          
          let finalPublishAt: string | null = null;
          
          if (postStatus === 'published') {
              if (isScheduled) {
                  finalPublishAt = new Date(publishDate).toISOString();
              } else {
                  finalPublishAt = new Date().toISOString();
              }
          }

          // Auto-generate tags based on primary tag
          const tags = ["ai prompt", "image prompt", uploadPrimaryTag];

          await createPost({
              image_url: url,
              prompt: uploadPrompt,
              category: uploadCategory,
              primary_tag: uploadPrimaryTag,
              tags: tags,
              creator: uploadCreator, // Use current state (Admin/Manual)
              creator_url: uploadCreatorUrl, // Use current state
              slug: slug,
              title: "AI Generated",
              status: postStatus,
              publish_at: finalPublishAt
          });

          setUploadStatus(postStatus === 'draft' ? "Saved as Draft!" : (isScheduled ? "Scheduled!" : "Published!"));
          setUploadFile(null);
          setUploadPreview('');
          setUploadPrompt('');
          setPublishDate('');
          setIsScheduled(false);
          
          triggerToast(postStatus === 'draft' ? "Draft Saved" : "Post Published");
          fetchData();
          setTimeout(() => setUploadStatus(""), 2000);
      } catch (err: any) {
          console.error(err);
          setUploadStatus("Error: " + (err.message || "Unknown error"));
      }
  };

  const handleDelete = async (id: string, imgUrl: string) => {
      if (!confirm("Are you sure you want to delete this post?")) return;
      setIsDeleting(id);
      
      try {
          await deletePost(id, imgUrl);
          setAdminPosts(prev => prev.filter(p => p.id !== id));
          triggerToast("Deleted");
          fetchData();
      } catch (e: any) {
          alert(`Failed to delete: ${e.message}`);
      } finally {
          setIsDeleting('');
      }
  };

  const triggerToast = (msg: string) => {
      setToastMessage(msg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
  };

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000);
  };

  const handleShare = async (post: Post) => {
      // Build URL based on category/type
      const PUBLIC_SITE_URL = "https://syntheticgood.site";
      const isChatGPT = (post.category || '').toLowerCase().includes('chatgpt') || 
                        (post.primary_tag || '').toLowerCase().includes('chatgpt');
      const route = isChatGPT ? 'chatgpt-prompt' : 'gemini-prompt';
      const slug = post.slug || post.id;
      const url = `${PUBLIC_SITE_URL}/${route}/${slug}`;
      
      const title = "Get Prompt";
      const shareText = `Get Prompt\n${url}`;

      if (!navigator.share) {
          await navigator.clipboard.writeText(url);
          triggerToast("URL post disalin");
          return;
      }

      try {
          let files: File[] = [];
          
          // Try to fetch image
          try {
            const response = await fetch(post.image_url);
            const blob = await response.blob();
            const file = new File([blob], 'image.jpg', { type: blob.type });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                files = [file];
            }
          } catch (e) {
            console.warn("Failed to prepare image for sharing", e);
          }

          if (files.length > 0) {
              // Share with image + URL as text
              await navigator.share({ 
                  title, 
                  text: shareText, 
                  files 
              });
          } else {
              // Fallback to URL sharing
              await navigator.share({ 
                  title, 
                  text: shareText,
                  url 
              });
          }
      } catch (err) {
          console.error("Share failed", err);
      }
  };

  // UPDATED: Direct redirect to Donation Link
  const handleDonateClick = () => {
    window.open(DONATION_LINK, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-100">
      <Header 
        onOpenSidebar={() => setIsSidebarOpen(true)} 
        onHomeClick={handleGoHome}
        isConnected={isConnected}
      />
      
      <SidePanel 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeCategory={activeCategory}
        onSelectCategory={handleCategoryChange}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setShowLoginModal(true)}
        onLogoutClick={handleLogout}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAdmin={handleOpenAdmin}
      />

      <main className="flex-grow container mx-auto px-4 pt-6 pb-8 max-w-7xl">
        
        {!isConnected && (
             <div className="flex justify-center mb-6">
                 <button onClick={() => setShowSettings(true)} className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-red-500/20">
                     <AlertCircle size={14}/> Not Connected. Open Settings
                 </button>
             </div>
        )}

        {/* DETAIL VIEW (Includes 404 Logic internally) */}
        {view === 'detail' && (
            <PostDetail 
                post={currentPost!} 
                onBack={handleGoHome} 
                banners={banners}
            />
        )}

        {/* HOME VIEW */}
        {view === 'home' && (
            <>
                <div className="flex justify-center mb-6">
                    <button onClick={handleDonateClick} className="neon-button bg-[var(--surface-light)] text-white px-6 py-2.5 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-lg group">
                        <Coffee size={18} className="text-yellow-500 group-hover:scale-110 transition-transform"/> 
                        <span className="text-sm tracking-wide">Buy me a coffee</span>
                    </button>
                </div>

                <SiteBanner banner={banners.top} variant="top" />

                {/* 1) MOST VIRAL */}
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Flame className="text-orange-500 fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider text-shadow-sm">Most Viral</h2>
                    </div>
                    
                    {loading && viralPosts.length === 0 ? (
                         <div className="flex gap-4 overflow-x-hidden">
                            {[1,2,3,4].map(i => <div key={i} className="min-w-[200px] h-[250px] rounded-xl skeleton-loader border border-[var(--neon-blue-ultra)]"></div>)}
                         </div>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x px-1">
                            {viralPosts.length > 0 ? viralPosts.map(post => (
                                <div key={post.id} className="min-w-[180px] w-[180px] md:min-w-[200px] md:w-[200px] snap-start">
                                    <Card 
                                      post={post} 
                                      onCopyPrompt={handleCopy} 
                                      onShare={handleShare} 
                                      onImageClick={(img) => setPreviewImage(img)}
                                    />
                                </div>
                            )) : (
                                <div className="text-gray-500 text-sm italic p-4">No viral posts found.</div>
                            )}
                        </div>
                    )}
                </section>

                {/* 2) NEW UPDATE - Added ID for Scroll Target */}
                <section id="latest-updates">
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Zap className="text-[var(--neon-blue)] fill-[var(--neon-blue)] drop-shadow-[0_0_8px_rgba(54,227,255,0.6)]" />
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider text-shadow-sm">New Update</h2>
                    </div>

                    {/* 
                      KEY CHANGE: 
                      1. Uses `key={currentPage + activeCategory}` to trigger entering animation when page changes 
                      2. Shows Skeletons when `loading` is true for this section
                    */}
                    <div 
                        key={currentPage + activeCategory} 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 animate-page-enter"
                    >
                        {loading ? (
                            // Show 10 Skeletons while loading
                            Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="w-full">
                                    <CardSkeleton />
                                </div>
                            ))
                        ) : (
                            newPosts.length > 0 ? newPosts.map(post => (
                                <div key={post.id} className="w-full">
                                    <Card 
                                      post={post} 
                                      onCopyPrompt={handleCopy} 
                                      onShare={handleShare} 
                                      onImageClick={(img) => setPreviewImage(img)}
                                    />
                                </div>
                            )) : (
                                <div className="col-span-full text-center text-gray-500 text-sm italic py-8">No posts found.</div>
                            )
                        )}
                    </div>

                    <div className="mt-12 mb-8">
                        <Pagination 
                            currentPage={currentPage}
                            totalItems={totalNewCount}
                            pageSize={10}
                            onPageChange={handlePageChange}
                        />
                    </div>

                    <SiteBanner banner={banners.bottom} variant="bottom" />
                </section>
            </>
        )}
      </main>

      <Footer />

      {/* --- MODALS --- */}

      {showToast && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-md border border-[var(--neon-purple)] text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.3)] z-[60] flex items-center gap-3 animate-fade-in">
              <Check size={18} className="text-green-400" />
              <span className="font-medium text-sm">{toastMessage}</span>
          </div>
      )}

      {showCopyToast && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowCopyToast(false)}>
              <div 
                className="modal-content p-8 max-w-sm text-center"
                onClick={(e) => e.stopPropagation()}
              >
                  <button onClick={() => setShowCopyToast(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-20"><X size={20}/></button>
                  
                  <div className="flex flex-col items-center justify-center gap-3 mb-6 relative z-10">
                      <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                        <Check size={32} strokeWidth={3} className="text-green-400"/>
                      </div>
                      <h3 className="text-2xl font-bold text-white">Copied!</h3>
                  </div>
                  
                  <p className="text-[var(--text-muted)] text-sm mb-6 relative z-10">
                      Prompt copied to clipboard. Support us?
                  </p>
                  
                  <div className="flex gap-3 justify-center relative z-10">
                      <button 
                        onClick={handleDonateClick}
                        className="bg-white text-black px-6 py-3 rounded-lg font-bold text-sm hover:bg-[var(--neon-blue)] transition-colors flex items-center gap-2 shadow-lg"
                      >
                          <Coffee size={16}/> Buy me a coffee ☕
                      </button>
                  </div>
              </div>
          </div>
      )}

      {showLoginModal && (
          <div className="modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) setShowLoginModal(false); }}>
              <div className="modal-content p-8 max-w-sm">
                  <div className="flex justify-between items-center mb-6 relative z-10">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2"><Lock size={20} className="text-[var(--neon-blue)]"/> Admin Login</h2>
                      <button onClick={() => setShowLoginModal(false)}><X className="text-gray-400 hover:text-white"/></button>
                  </div>
                  <form onSubmit={handleAdminLogin} className="space-y-4 relative z-10">
                      <input id="admin-email" type="email" placeholder="Email" className="settings-input" required />
                      <input id="admin-pass" type="password" placeholder="Password" className="settings-input" required />
                      <div className="text-xs text-[var(--neon-blue)] text-center h-4">{uploadStatus}</div>
                      <button type="submit" className="action-btn w-full flex items-center justify-center gap-2">
                          <LogIn size={16}/> Login
                      </button>
                  </form>
              </div>
          </div>
      )}

      {showAdminPanel && isLoggedIn && (
          <div className="modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) setShowAdminPanel(false); }}>
              <div className="modal-content p-0 max-w-2xl max-h-[85vh] flex flex-col">
                  {/* Modal Header */}
                  <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[var(--surface-dark)] relative z-10">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <LayoutDashboard size={20} className="text-[var(--neon-purple)]"/> Admin Dashboard
                      </h2>
                      <button onClick={() => setShowAdminPanel(false)}><X className="text-gray-400 hover:text-white"/></button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-white/10 bg-[var(--surface-dark)] relative z-10">
                      <button 
                        onClick={() => setAdminTab('create')}
                        className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${adminTab === 'create' ? 'text-[var(--neon-blue)] border-b-2 border-[var(--neon-blue)] bg-white/5' : 'text-gray-400 hover:text-white'}`}
                      >
                          <PlusSquare size={16}/> Create Post
                      </button>
                      <button 
                        onClick={() => setAdminTab('manage')}
                        className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${adminTab === 'manage' ? 'text-[var(--neon-blue)] border-b-2 border-[var(--neon-blue)] bg-white/5' : 'text-gray-400 hover:text-white'}`}
                      >
                          <LayoutDashboard size={16}/> Manage Posts
                      </button>
                      <button 
                        onClick={() => setAdminTab('banners')}
                        className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${adminTab === 'banners' ? 'text-[var(--neon-blue)] border-b-2 border-[var(--neon-blue)] bg-white/5' : 'text-gray-400 hover:text-white'}`}
                      >
                          <Megaphone size={16}/> Site Banners
                      </button>
                  </div>
                  
                  {/* Content Area */}
                  <div className="p-6 overflow-y-auto flex-grow relative z-10">
                      {adminTab === 'create' && (
                        <form onSubmit={handlePublish} className="space-y-4">
                            {/* Publishing Control */}
                            <div className="flex items-center gap-4 bg-black/30 p-3 rounded-lg border border-white/10">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 font-bold uppercase block mb-1">Status</label>
                                    <select 
                                        className="w-full bg-black text-white text-sm border border-gray-700 rounded p-1.5 focus:border-[var(--neon-blue)] outline-none"
                                        value={postStatus}
                                        onChange={(e) => setPostStatus(e.target.value as 'draft'|'published')}
                                    >
                                        <option value="published">Published</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 font-bold uppercase block mb-1 flex items-center gap-1">
                                        <Clock size={10}/> Schedule?
                                    </label>
                                    <div className="flex items-center h-[34px]">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 accent-[var(--neon-blue)] cursor-pointer"
                                            checked={isScheduled}
                                            onChange={(e) => setIsScheduled(e.target.checked)}
                                        />
                                        <span className="ml-2 text-xs text-gray-400">{isScheduled ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {isScheduled && (
                                <div>
                                    <label className="text-xs text-[var(--neon-blue)] font-bold uppercase block mb-1">Publish At (Local Time)</label>
                                    <input 
                                        type="datetime-local" 
                                        className="settings-input"
                                        value={publishDate}
                                        onChange={(e) => setPublishDate(e.target.value)}
                                        required={isScheduled}
                                    />
                                </div>
                            )}

                            {/* Image */}
                            <div className="relative border-2 border-dashed border-gray-700 rounded-lg h-40 flex flex-col items-center justify-center bg-black/20 hover:border-[var(--neon-purple)] hover:bg-black/40 transition-all cursor-pointer overflow-hidden group">
                                <input type="file" className="absolute inset-0 opacity-0 z-10 cursor-pointer" accept="image/*" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setUploadFile(file);
                                        const reader = new FileReader();
                                        reader.onload = (ev) => setUploadPreview(ev.target?.result as string);
                                        reader.readAsDataURL(file);
                                    }
                                }} />
                                {uploadPreview ? (
                                    <img src={uploadPreview} className="absolute inset-0 w-full h-full object-contain bg-black" />
                                ) : (
                                    <div className="text-gray-400 flex flex-col items-center group-hover:text-[var(--neon-purple)] transition-colors"><Upload size={24}/><span className="text-xs mt-2">Upload Image</span></div>
                                )}
                            </div>
                            
                            {/* Primary Tag & Category */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-[var(--neon-blue)] font-bold uppercase block mb-1">1. Primary Tag</label>
                                    <select className="settings-input appearance-none cursor-pointer" value={uploadPrimaryTag} onChange={e => setUploadPrimaryTag(e.target.value)} required>
                                        <option value="gemini prompt">Gemini Prompt</option>
                                        <option value="chatgpt prompt">ChatGPT Prompt</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-[var(--neon-blue)] font-bold uppercase block mb-1">2. Category</label>
                                    <select className="settings-input appearance-none cursor-pointer" value={uploadCategory} onChange={e => setUploadCategory(e.target.value)} required>
                                        <option value="">Select Category</option>
                                        {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Creator Section */}
                            <div className="bg-white/5 p-3 rounded-lg border border-white/10 space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs text-[var(--neon-blue)] font-bold uppercase">Creator Info</label>
                                    <div className="flex bg-black rounded p-0.5 border border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUploadCreatorMode('admin');
                                                setUploadCreator(settingsForm.defaultCreator);
                                                setUploadCreatorUrl(settingsForm.defaultCreatorUrl);
                                            }}
                                            className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${uploadCreatorMode === 'admin' ? 'bg-[var(--neon-blue)] text-black' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            Admin
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUploadCreatorMode('manual');
                                                setUploadCreator('');
                                                setUploadCreatorUrl('');
                                            }}
                                            className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${uploadCreatorMode === 'manual' ? 'bg-[var(--neon-blue)] text-black' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            Manual
                                        </button>
                                    </div>
                                </div>

                                {uploadCreatorMode === 'manual' ? (
                                    <div className="grid grid-cols-2 gap-3 animate-fade-in">
                                        <div>
                                            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Name</label>
                                            <input className="settings-input text-xs py-1.5" placeholder="Name" value={uploadCreator} onChange={e => setUploadCreator(e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">URL (https://)</label>
                                            <input className="settings-input text-xs py-1.5" placeholder="https://..." value={uploadCreatorUrl} onChange={e => setUploadCreatorUrl(e.target.value)} required />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        Posting as <span className="text-white font-bold">{uploadCreator}</span>
                                    </div>
                                )}
                            </div>

                            {/* Prompt */}
                            <textarea className="settings-input h-24 font-mono text-sm" placeholder="Prompt..." value={uploadPrompt} onChange={e => setUploadPrompt(e.target.value)} required></textarea>

                            <div className="text-xs text-[var(--neon-blue)] text-center font-bold h-4">{uploadStatus}</div>
                            <button type="submit" className="action-btn w-full">
                                {postStatus === 'draft' ? 'Save Draft' : (isScheduled ? 'Schedule Post' : 'Publish Now')}
                            </button>
                        </form>
                      )}

                      {adminTab === 'manage' && (
                          <div className="space-y-3">
                              {adminPosts.length === 0 && <div className="text-center text-gray-500 py-8">No posts found</div>}
                              {adminPosts.map(post => {
                                  // Determine badge
                                  const isDraft = post.status === 'draft';
                                  const isScheduled = post.publish_at && new Date(post.publish_at) > new Date();
                                  
                                  return (
                                    <div key={post.id} className="flex items-center gap-4 bg-black/40 p-3 rounded-lg border border-white/10 hover:border-[var(--neon-blue-soft)] transition-colors">
                                        <img src={post.image_url} className="w-12 h-12 object-cover rounded bg-gray-900" />
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-white text-sm font-bold truncate">{post.title || "Untitled"}</span>
                                                {isDraft && <span className="text-[9px] bg-gray-700 text-gray-300 px-1 rounded uppercase">Draft</span>}
                                                {isScheduled && <span className="text-[9px] bg-blue-900 text-blue-300 px-1 rounded uppercase flex items-center gap-1"><Clock size={8}/> Scheduled</span>}
                                                {!isDraft && !isScheduled && <span className="text-[9px] bg-green-900 text-green-300 px-1 rounded uppercase">Published</span>}
                                            </div>
                                            <div className="text-xs text-gray-400">{post.category} • {post.primary_tag}</div>
                                            {post.publish_at && <div className="text-[10px] text-gray-500 mt-1">Due: {new Date(post.publish_at).toLocaleString()}</div>}
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(post.id, post.image_url)}
                                            disabled={isDeleting === post.id}
                                            className="text-red-500 p-2 hover:bg-red-500/10 rounded disabled:opacity-50 disabled:cursor-wait flex items-center justify-center min-w-[40px]"
                                        >
                                            {isDeleting === post.id ? <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"/> : <Trash2 size={18} />}
                                        </button>
                                    </div>
                                  );
                              })}
                          </div>
                      )}

                      {adminTab === 'banners' && (
                          <div className="space-y-6 animate-fade-in">
                              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                                  <h4 className="text-blue-400 font-bold text-sm mb-1 flex items-center gap-2">
                                      <Megaphone size={14}/> Banner Management
                                  </h4>
                                  <p className="text-xs text-gray-400">
                                      Manage the promotional banners displayed on the Homepage and Post Detail pages. 
                                      Changes are applied immediately after saving.
                                  </p>
                              </div>

                              <BannerForm 
                                  title="Top Banner" 
                                  banner={banners.top} 
                                  onSave={handleSaveBanner} 
                              />
                              
                              <BannerForm 
                                  title="Bottom Banner" 
                                  banner={banners.bottom} 
                                  onSave={handleSaveBanner} 
                              />
                              
                              <div className="text-xs text-[var(--neon-blue)] text-center h-4 font-bold">{uploadStatus}</div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {showSettings && isLoggedIn && (
          <div className="modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) setShowSettings(false); }}>
              <div className="modal-content p-6">
                  <div className="flex justify-between items-center mb-4 relative z-10">
                      <h2 className="text-xl font-bold text-white">App Settings</h2>
                      <button onClick={() => setShowSettings(false)}><X className="text-gray-400 hover:text-white"/></button>
                  </div>
                  <div className="space-y-4 relative z-10">
                      <div>
                          <label className="text-xs text-gray-400">Supabase URL</label>
                          <input className="settings-input" value={settingsForm.supabaseUrl} onChange={e => setSettingsForm({...settingsForm, supabaseUrl: e.target.value})} placeholder="https://..." />
                      </div>
                      <div>
                          <label className="text-xs text-gray-400">Supabase Anon Key</label>
                          <input className="settings-input" type="password" value={settingsForm.supabaseKey} onChange={e => setSettingsForm({...settingsForm, supabaseKey: e.target.value})} placeholder="eyJh..." />
                      </div>
                      <button onClick={handleSaveSettings} className="action-btn w-full mt-2">Save & Connect</button>
                  </div>
              </div>
          </div>
      )}
      
      {previewImage && (
          <div className="modal-overlay z-[70] flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
              <button 
                className="absolute top-6 right-6 text-white bg-black/50 hover:bg-red-500 rounded-full p-2 transition-colors z-10"
                onClick={() => setPreviewImage(null)}
              >
                  <X size={28}/>
              </button>
              <img 
                src={previewImage} 
                alt="Preview" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-gray-800"
                onClick={(e) => e.stopPropagation()} 
              />
          </div>
      )}

    </div>
  );
};

export default App;
