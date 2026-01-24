import React, { useState, useEffect } from 'react';
import { Post, CategoryType, AppSettings, DEFAULT_SETTINGS } from './types';
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
  deletePost
} from './services/supabaseService';
import Header from './components/Header';
import SidePanel from './components/SidePanel';
import Footer from './components/Footer';
import Card from './components/Card';
import PostDetail from './components/PostDetail';
import Pagination from './components/Pagination';
import PromoBanner from './components/PromoBanner';
import { Zap, Flame, X, Coffee, AlertCircle, Share2, Upload, Check, Lock, LogIn, Trash2, LayoutDashboard, PlusSquare, ArrowLeft } from 'lucide-react';
import { CATEGORIES } from './constants';

const QRIS_IMAGE = "https://mdpyyaopokewvrumdpwd.supabase.co/storage/v1/object/public/post-images/IMG-20260124-WA0001.jpg";
const PAYPAL_LINK = "https://www.paypal.me/Candraxml";

const App: React.FC = () => {
  // --- Global State ---
  const [view, setView] = useState<'home' | 'detail' | 'qris'>('home');
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
  const [showDonate, setShowDonate] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // --- Admin State ---
  const [settingsForm, setSettingsForm] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [adminTab, setAdminTab] = useState<'create' | 'manage'>('create');
  const [adminPosts, setAdminPosts] = useState<Post[]>([]);
  const [isDeleting, setIsDeleting] = useState('');
  
  // Admin Upload Form
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [uploadPrompt, setUploadPrompt] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadCreator, setUploadCreator] = useState('');
  const [uploadCreatorUrl, setUploadCreatorUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

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
    
    // --- Routing: Check for Query Param (?slug=...) ---
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (slug && slug !== 'null') {
      handleOpenSlug(slug, false); // false = don't push state, we are already there
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const v = await getViralPosts();
    setViralPosts(v);
    
    const n = await getNewPosts(1, 10, 'All');
    setNewPosts(n.data);
    setTotalNewCount(n.count);
    setLoading(false);
  };

  // --- Handlers ---

  const handleOpenSlug = async (slug: string, pushState = true) => {
    const p = await getPostBySlug(slug);
    if (p) {
      setCurrentPost(p);
      setView('detail');
      if (pushState) {
        // Update URL to ?slug=XYZ without reloading
        const newUrl = `${window.location.pathname}?slug=${slug}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    } else {
      triggerToast("Post not found");
      // Clear invalid slug from URL
      window.history.pushState({}, '', window.location.pathname);
      setView('home');
    }
  };

  const handleBackToHome = () => {
    // Clear Query Param
    window.history.pushState({}, '', window.location.pathname);
    setView('home');
  };

  const handleCategoryChange = async (cat: CategoryType) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    setIsSidebarOpen(false);
    if (view !== 'home') {
        handleBackToHome();
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
    window.scrollTo({top: 400, behavior: 'smooth'});
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
      setUploadCreator(settingsForm.defaultCreator);
      setUploadCreatorUrl(settingsForm.defaultCreatorUrl);
      setUploadStatus("");
      setAdminTab('create');
      setShowAdminPanel(true);
  };

  const fetchAdminPosts = async () => {
      try {
          const p = await getAdminPosts(20);
          setAdminPosts(p);
      } catch(e) { console.error(e); }
  };

  useEffect(() => {
      if (showAdminPanel && adminTab === 'manage') {
          fetchAdminPosts();
      }
  }, [showAdminPanel, adminTab]);

  const handlePublish = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!uploadFile || !uploadPrompt || !uploadCategory) {
          alert("Image, Prompt and Category are required");
          return;
      }

      try {
          setUploadStatus("Uploading Image...");
          const url = await uploadImage(uploadFile);
          
          setUploadStatus("Publishing...");
          const slug = generateSlug();
          
          await createPost({
              image_url: url,
              prompt: uploadPrompt,
              category: uploadCategory,
              creator: uploadCreator,
              creator_url: uploadCreatorUrl,
              slug: slug,
              title: "AI Generated"
          });

          setUploadStatus("Published!");
          setUploadFile(null);
          setUploadPreview('');
          setUploadPrompt('');
          
          triggerToast("Post Published Successfully!");
          fetchData();
          setTimeout(() => setUploadStatus(""), 2000);
      } catch (err: any) {
          setUploadStatus("Error: " + err.message);
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
          const msg = e.message || e.error_description || "Unknown error occurred";
          alert(`Failed to delete: ${msg}`);
          console.error(e);
      } finally {
          setIsDeleting('');
      }
  };

  const triggerToast = (msg: string) => {
      setToastMessage(msg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
  };

  // Interactions
  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000);
  };

  const handleShare = async (post: Post) => {
      // Logic Update: Use Query Param URL
      const slug = post.slug || '';
      const url = slug 
        ? `${window.location.origin}/?slug=${slug}`
        : window.location.origin;

      if (navigator.share) {
          try {
              // Share ONLY the URL
              await navigator.share({ url });
          } catch (err) { console.error(err); }
      } else {
          navigator.clipboard.writeText(url);
          triggerToast("Link copied!");
      }
  };
  
  // Handler to open Detail view from Card Title click
  const handleTitleClick = (post: Post) => {
      if(post.slug) handleOpenSlug(post.slug, true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] font-sans">
      <Header 
        onOpenSidebar={() => setIsSidebarOpen(true)} 
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

      <main className="flex-grow container mx-auto px-4 pt-1 pb-8 mt-14 md:mt-16 max-w-7xl">
        
        {!isConnected && (
             <div className="flex justify-center mb-6">
                 <button onClick={() => setShowSettings(true)} className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-red-500/20">
                     <AlertCircle size={14}/> Not Connected. Open Settings
                 </button>
             </div>
        )}

        {/* QRIS FULL PAGE VIEW */}
        {view === 'qris' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                <button 
                  onClick={handleBackToHome} 
                  className="self-start mb-6 flex items-center gap-2 text-neonBlue hover:text-white transition-colors"
                >
                    <ArrowLeft size={20}/> Back
                </button>
                <h1 className="text-2xl font-bold text-white mb-6">Scan QRIS</h1>
                <div className="bg-white p-4 rounded-xl shadow-2xl max-w-full">
                    <img 
                        src={QRIS_IMAGE} 
                        alt="QRIS Code" 
                        className="max-w-[92vw] max-h-[75vh] object-contain"
                    />
                </div>
            </div>
        )}

        {/* DETAIL VIEW */}
        {view === 'detail' && currentPost && (
            <PostDetail 
                post={currentPost} 
                onBack={handleBackToHome} 
            />
        )}

        {/* HOME VIEW */}
        {view === 'home' && (
            <>
                <PromoBanner />

                {/* 1) MOST VIRAL */}
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <Flame className="text-orange-500 fill-orange-500" />
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Most Viral</h2>
                    </div>
                    
                    {loading && viralPosts.length === 0 ? (
                         <div className="flex gap-4 overflow-x-hidden">
                            {[1,2,3,4].map(i => <div key={i} className="min-w-[200px] h-[250px] bg-gray-900 rounded-xl animate-pulse"></div>)}
                         </div>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
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

                {/* 2) NEW UPDATE */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="text-neonBlue fill-neonBlue" />
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider">New Update</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {newPosts.length > 0 ? newPosts.map(post => (
                            <div key={post.id} className="w-full">
                                <Card 
                                  post={post} 
                                  onCopyPrompt={handleCopy} 
                                  onShare={handleShare} 
                                  onImageClick={(img) => setPreviewImage(img)}
                                />
                            </div>
                        )) : (
                            !loading && <div className="col-span-full text-center text-gray-500 text-sm italic py-8">No posts found for this category.</div>
                        )}
                    </div>

                    {loading && <div className="text-center py-8 text-neonBlue animate-pulse">Loading updates...</div>}

                    <div className="mt-8">
                        <Pagination 
                            currentPage={currentPage}
                            totalItems={totalNewCount}
                            pageSize={10}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </section>

                <div className="mt-12 text-center">
                    <button onClick={() => setShowDonate(true)} className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 mx-auto transition-colors">
                        <Coffee size={18} className="text-yellow-500"/> Buy me a coffee
                    </button>
                </div>
            </>
        )}
      </main>

      <Footer />

      {/* --- MODALS --- */}

      {showToast && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur border border-neonPurple/50 text-white px-6 py-3 rounded-full shadow-2xl z-[60] flex items-center gap-3 animate-fade-in">
              <Check size={18} className="text-green-400" />
              <span className="font-medium text-sm">{toastMessage}</span>
              <button onClick={() => setShowToast(false)} className="ml-2 text-gray-500 hover:text-white"><X size={14}/></button>
          </div>
      )}

      {showCopyToast && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowCopyToast(false)}>
              <div 
                className="bg-[#120725] border border-neonPurple p-6 rounded-xl relative max-w-sm w-full text-center shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                onClick={(e) => e.stopPropagation()}
              >
                  <button onClick={() => setShowCopyToast(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white"><X size={20}/></button>
                  
                  <div className="flex items-center justify-center gap-2 text-green-400 font-bold text-xl mb-4">
                      <Check size={24} strokeWidth={3} /> Copied!
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 flex items-center justify-center gap-1">
                      Buy me a coffee? <Coffee size={14} className="text-orange-400"/>
                  </p>
                  
                  <div className="flex gap-3 justify-center">
                      <button 
                        onClick={() => { 
                            setView('qris'); 
                            setShowCopyToast(false);
                            window.scrollTo({top:0, behavior:'smooth'});
                        }}
                        className="bg-white text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                          <Zap size={16}/> QRIS
                      </button>
                      <a 
                        href={PAYPAL_LINK} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-[#003087] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#00256b] transition-colors"
                      >
                          PayPal
                      </a>
                  </div>
              </div>
          </div>
      )}

      {showLoginModal && (
          <div className="modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) setShowLoginModal(false); }}>
              <div className="modal-content p-6 max-w-sm">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2"><Lock size={20}/> Admin Login</h2>
                      <button onClick={() => setShowLoginModal(false)}><X className="text-gray-400 hover:text-white"/></button>
                  </div>
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                      <input id="admin-email" type="email" placeholder="Email" className="settings-input" required />
                      <input id="admin-pass" type="password" placeholder="Password" className="settings-input" required />
                      <div className="text-xs text-neonBlue text-center h-4">{uploadStatus}</div>
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
                  <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0b0b14]">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <LayoutDashboard size={20} className="text-neonPurple"/> Admin Dashboard
                      </h2>
                      <button onClick={() => setShowAdminPanel(false)}><X className="text-gray-400 hover:text-white"/></button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-gray-800 bg-[#0b0b14]">
                      <button 
                        onClick={() => setAdminTab('create')}
                        className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${adminTab === 'create' ? 'text-neonBlue border-b-2 border-neonBlue bg-white/5' : 'text-gray-400 hover:text-white'}`}
                      >
                          <PlusSquare size={16}/> Create Post
                      </button>
                      <button 
                        onClick={() => setAdminTab('manage')}
                        className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${adminTab === 'manage' ? 'text-neonBlue border-b-2 border-neonBlue bg-white/5' : 'text-gray-400 hover:text-white'}`}
                      >
                          <LayoutDashboard size={16}/> Manage Posts
                      </button>
                  </div>
                  
                  {/* Content Area */}
                  <div className="p-6 overflow-y-auto flex-grow bg-[#120725]">
                      {adminTab === 'create' ? (
                        <form onSubmit={handlePublish} className="space-y-4">
                            {/* Image */}
                            <div className="relative border-2 border-dashed border-gray-700 rounded-lg h-40 flex flex-col items-center justify-center bg-black/40 hover:border-neonPurple cursor-pointer overflow-hidden">
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
                                    <div className="text-gray-400 flex flex-col items-center"><Upload size={24}/><span className="text-xs mt-2">Upload Image</span></div>
                                )}
                            </div>
                            
                            {/* Category Dropdown */}
                            <select className="settings-input appearance-none cursor-pointer" value={uploadCategory} onChange={e => setUploadCategory(e.target.value)} required>
                                <option value="">Select Category</option>
                                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            {/* Prompt */}
                            <textarea className="settings-input h-24 font-mono text-sm" placeholder="Prompt..." value={uploadPrompt} onChange={e => setUploadPrompt(e.target.value)} required></textarea>

                            {/* Creator Info */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold">Creator Name</label>
                                    <input className="settings-input" placeholder="Creator" value={uploadCreator} onChange={e => setUploadCreator(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold">Creator URL</label>
                                    <input className="settings-input" placeholder="Creator URL" value={uploadCreatorUrl} onChange={e => setUploadCreatorUrl(e.target.value)} />
                                </div>
                            </div>

                            <div className="text-xs text-neonBlue text-center font-bold h-4">{uploadStatus}</div>
                            <button type="submit" className="action-btn w-full">Publish Post</button>
                        </form>
                      ) : (
                          <div className="space-y-3">
                              {adminPosts.length === 0 && <div className="text-center text-gray-500 py-8">No recent posts</div>}
                              {adminPosts.map(post => (
                                  <div key={post.id} className="flex items-center gap-4 bg-black/40 p-3 rounded-lg border border-gray-800">
                                      <img src={post.image_url} className="w-12 h-12 object-cover rounded bg-gray-900" />
                                      <div className="flex-grow min-w-0">
                                          <div className="text-white text-sm font-bold truncate">{post.title || "Untitled"}</div>
                                          <div className="text-xs text-gray-400">{post.category} • {post.slug}</div>
                                      </div>
                                      <button 
                                        onClick={() => handleDelete(post.id, post.image_url)}
                                        disabled={isDeleting === post.id}
                                        className="text-red-500 p-2 hover:bg-red-500/10 rounded disabled:opacity-50 disabled:cursor-wait flex items-center justify-center min-w-[40px]"
                                      >
                                          {isDeleting === post.id ? <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"/> : <Trash2 size={18} />}
                                      </button>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {showSettings && isLoggedIn && (
          <div className="modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) setShowSettings(false); }}>
              <div className="modal-content p-6">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-white">App Settings</h2>
                      <button onClick={() => setShowSettings(false)}><X className="text-gray-400 hover:text-white"/></button>
                  </div>
                  <div className="space-y-4">
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

      {showDonate && (
          <div className="modal-overlay" onClick={() => setShowDonate(false)}>
              <div className="modal-content p-6 max-w-sm text-center bg-[#120725] border border-neonPurple relative">
                  <button onClick={() => setShowDonate(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24}/></button>
                  
                  <div className="mb-6 flex justify-center">
                      <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400">
                          <Coffee size={32} />
                      </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">Buy me a coffee</h3>
                  <p className="text-gray-400 text-sm mb-6">Support the server costs and keep the prompts free!</p>
                  
                  <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => { setShowDonate(false); setView('qris'); window.scrollTo({top:0, behavior:'smooth'}); }}
                        className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                      >
                          <Zap size={18} className="text-black"/> Scan QRIS
                      </button>
                      
                      <a 
                        href={PAYPAL_LINK} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full py-3 bg-[#003087] text-white font-bold rounded-lg hover:bg-[#00256b] transition-colors flex items-center justify-center gap-2"
                      >
                          <span>PayPal</span>
                      </a>
                  </div>
              </div>
          </div>
      )}
      
      {previewImage && (
          <div className="modal-overlay z-[70] flex items-center justify-center" onClick={() => setPreviewImage(null)}>
              <button 
                className="absolute top-6 right-6 text-white bg-black/50 hover:bg-red-500 rounded-full p-2 transition-colors"
                onClick={() => setPreviewImage(null)}
              >
                  <X size={28}/>
              </button>
              <img 
                src={previewImage} 
                alt="Preview" 
                className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl"
                onClick={(e) => e.stopPropagation()} 
              />
          </div>
      )}

    </div>
  );
};

export default App;