import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaPen, FaTrash, FaTimes, FaArrowRight, FaCloudUploadAlt,
  FaBookOpen, FaPaperPlane, FaClock, FaImage
} from 'react-icons/fa';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [filter, setFilter] = useState('All');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for form data including image preview
  const [formData, setFormData] = useState({
    id: null, title: '', category: 'Tech News',
    description: '', content: '', read_time: '5 min read', image_url: ''
  });
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isMainAdmin = user && user.role === 'main_admin';

  // Fetch articles from API
  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles?limit=30');
      const data = await res.json();
      setArticles(data);
      const searchParams = new URLSearchParams(location.search);
      const titleToOpen = searchParams.get('title');
      if (titleToOpen) {
          const matchedArticle = data.find(a => a.title.toLowerCase() === titleToOpen.toLowerCase());
          if (matchedArticle) {
              handleSelectArticle(matchedArticle);
          }
      }
    } catch (err) {
      console.error("Failed to fetch articles", err);
    }
  };

  useEffect(() => { 
    if (!user) {
      navigate('/login', { state: { blink: true, blinkId: Date.now(), redirectMessage: 'Please Login or Register to access Articles.' } });
    } else {
      fetchArticles(); 
    }
  }, [user, navigate]);
  
  const handleSelectArticle = async (article) => {
    setSelectedArticle(article);
    setLoadingArticle(true);
    try {
      const res = await fetch(`/api/articles/${article.id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedArticle(data);
      }
    } catch (err) {
      console.error("Failed to fetch full article", err);
    } finally {
      setLoadingArticle(false);
    }
  };

  // Diverse placeholders to keep the UI fresh
  const placeholderImages = [
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=1964",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=1974"
  ];

  // Handle Image Selection from Media
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image_url: reader.result }); // Storing as base64 for demo
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const method = editMode ? 'PUT' : 'POST';
    const url = editMode ? `/api/articles/${formData.id}` : '/api/articles';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowAdminModal(false);
        setImagePreview(null);
        fetchArticles();
        alert(editMode ? "Updated successfully!" : "Published successfully!");
      } else {
        alert("Failed to publish. Please check your connection.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while connecting to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setArticles(articles.filter(a => a.id !== id));
    } catch (err) { console.error(err); }
  };

  const filteredArticles = filter === 'All' ? articles : articles.filter(a => a.category === filter);

  const inputStyle = "w-full bg-white/60 backdrop-blur-sm border border-cyan-200 rounded-2xl py-4 px-6 outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-300/30 font-bold text-cyan-900 transition-all placeholder-cyan-700/50 shadow-inner";

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-pink-50 relative overflow-hidden font-sans pb-32">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none mix-blend-multiply opacity-20">
        <img src="/steampunk_clock_bg.png" alt="Background" className="absolute w-full h-full object-cover" />
      </div>
      
      {/* Vibrant RGB Glowing Orbs for "fancy design" */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-400 rounded-full mix-blend-multiply filter blur-[150px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-pink-400 rounded-full mix-blend-multiply filter blur-[150px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[200px] opacity-30"></div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* Central Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 relative">
          <div className="mb-4">
            <span className="inline-block bg-white/60 border border-cyan-300 text-cyan-800 px-6 py-2 rounded-full text-xs font-extrabold tracking-[0.2em] uppercase backdrop-blur-md shadow-sm">
              Deep Dive Into Tech
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 relative inline-block tracking-tight drop-shadow-lg pb-2">
            Digital Journal
          </h1>

          {isMainAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setEditMode(false);
                setImagePreview(null);
                setFormData({ title: '', category: 'Tech News', description: '', content: '', read_time: '5 min read', image_url: '' });
                setShowAdminModal(true);
              }}
              className="mt-8 bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 text-white px-12 py-3 rounded-[20px] font-black shadow-[0_10px_20px_rgba(0,255,255,0.3)] flex items-center gap-3 mx-auto text-xs uppercase tracking-widest hover:shadow-[0_15px_30px_rgba(0,255,255,0.5)] transition-all border border-cyan-300"
            >
              + Create New Post
            </motion.button>
          )}
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-16 relative z-10">
          {['All', 'Interview Tips', 'Career Guidance', 'Tech News'].map(cat => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat)}
              className={`px-8 py-3 rounded-full text-xs font-black tracking-[0.1em] uppercase transition-all duration-300 border backdrop-blur-md
                ${filter === cat 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-pink-400 shadow-[0_10px_20px_rgba(255,105,180,0.4)] transform -translate-y-1' 
                  : 'bg-white/60 text-cyan-900 border-cyan-200 hover:bg-white hover:text-pink-600 shadow-sm hover:shadow-md'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid - Aqua Gradient Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {filteredArticles.map((article, index) => (
            <motion.div layout key={article.id} className="group bg-gradient-to-br from-cyan-100/90 via-teal-50/90 to-cyan-200/90 backdrop-blur-2xl rounded-3xl border-2 border-white/60 overflow-hidden shadow-[0_10px_40px_rgba(0,200,255,0.15)] hover:shadow-[0_20px_50px_rgba(0,200,255,0.3)] hover:border-cyan-300 transition-all duration-500 flex flex-col h-full cursor-pointer transform hover:-translate-y-2" onClick={() => handleSelectArticle(article)}>
              <div className="p-3">
                <div className="rounded-2xl overflow-hidden aspect-[16/10] bg-cyan-900/10 relative shadow-inner">
                  <img src={article.image_url || placeholderImages[index % placeholderImages.length]} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/60 via-transparent to-transparent opacity-80"></div>
                  
                  {isMainAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                      <button onClick={(e) => { e.stopPropagation(); setEditMode(true); setFormData(article); setImagePreview(article.image_url); setShowAdminModal(true); }} className="bg-white/90 backdrop-blur p-2 rounded-xl text-cyan-600 shadow-lg hover:text-cyan-800 hover:bg-white"><FaPen size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(article.id); }} className="bg-white/90 backdrop-blur p-2 rounded-xl text-red-500 shadow-lg hover:text-red-700 hover:bg-white"><FaTrash size={14} /></button>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow relative">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-pink-600 font-black text-[9px] uppercase tracking-widest bg-pink-100 border border-pink-200 px-3 py-1 rounded-lg shadow-sm">{article.category}</span>
                  <span className="text-cyan-800 font-bold text-[10px] flex items-center gap-1 bg-white/50 px-2 py-1 rounded-md"><FaClock /> {article.read_time}</span>
                </div>
                <h3 className="text-2xl font-black text-cyan-950 mb-3 leading-tight line-clamp-2 group-hover:text-purple-600 transition-colors drop-shadow-sm">{article.title}</h3>
                <p className="text-cyan-800/80 text-sm line-clamp-3 mb-6 flex-grow font-medium">{article.description}</p>
                <div className="w-full py-3.5 rounded-xl bg-white/60 text-cyan-700 font-black text-[10px] uppercase tracking-[0.2em] group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:via-teal-400 group-hover:to-cyan-500 group-hover:text-white shadow-sm group-hover:shadow-[0_10px_20px_rgba(0,255,255,0.4)] transition-all duration-300 flex items-center justify-center gap-2 border border-white">
                  Read Article <FaArrowRight />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reader Modal (Light Vibrant RGB Theme) */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-cyan-950/30 backdrop-blur-xl" onClick={() => setSelectedArticle(null)}>
            <motion.div initial={{ y: 50, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 50, opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl bg-white/80 backdrop-blur-3xl border-2 border-white/60 rounded-[40px] shadow-[0_20px_70px_rgba(0,150,255,0.2)] overflow-hidden flex flex-col max-h-[90vh] relative">
              <div className="h-80 w-full relative">
                <img src={selectedArticle.image_url || placeholderImages[0]} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent"></div>
                <button onClick={() => setSelectedArticle(null)} className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center text-cyan-600 hover:bg-white hover:text-pink-500 hover:scale-110 transition-all shadow-xl z-10"><FaTimes size={20} /></button>
              </div>
              <div className="p-8 md:p-12 overflow-y-auto relative z-10 -mt-20">
                <div className="bg-white/70 backdrop-blur-2xl border border-white p-8 md:p-10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="bg-gradient-to-r from-pink-400 to-purple-500 text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md">{selectedArticle.category}</span>
                    <span className="text-cyan-700 font-bold text-xs flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-lg"><FaClock /> {selectedArticle.read_time}</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-900 to-purple-900 mb-8 leading-tight drop-shadow-sm">{selectedArticle.title}</h2>
                  <div className="text-cyan-900 text-lg leading-relaxed whitespace-pre-line font-medium border-t border-cyan-100 pt-8">
                    {loadingArticle ? (
                      <div className="flex flex-col items-center py-10 gap-4">
                        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-bold text-cyan-600 animate-pulse">Gathering deep insights...</p>
                      </div>
                    ) : (
                      selectedArticle.content || selectedArticle.description
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Post Modal (Light Vibrant RGB Theme) */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-cyan-950/30 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-3xl bg-gradient-to-br from-white/90 to-cyan-50/90 backdrop-blur-3xl border-2 border-white rounded-[40px] shadow-[0_20px_70px_rgba(0,150,255,0.2)] overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 p-8 flex items-center justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                <div className="flex items-center gap-5 relative z-10">
                  <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl text-white shadow-inner"><FaBookOpen size={28} /></div>
                  <div>
                    <h3 className="text-white font-black uppercase tracking-widest text-lg drop-shadow-md">{editMode ? 'Edit Article' : 'Create Article'}</h3>
                    <p className="text-cyan-50 text-[11px] font-bold tracking-wide mt-1">Manage your digital journal</p>
                  </div>
                </div>
                <button onClick={() => setShowAdminModal(false)} className="bg-white/20 p-3 rounded-xl text-white hover:bg-white hover:text-cyan-600 transition-all shadow-sm relative z-10"><FaTimes size={20} /></button>
              </div>

              <form onSubmit={handleAdminSubmit} className="p-8 md:p-10 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] ml-2">Article Title</label>
                    <input type="text" required className={inputStyle} placeholder="Main Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] ml-2">Category</label>
                    <select className={inputStyle} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                      <option value="Tech News">Tech News</option>
                      <option value="Interview Tips">Interview Tips</option>
                      <option value="Career Guidance">Career Guidance</option>
                    </select>
                  </div>
                </div>

                {/* Image Upload Logic */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] ml-2">Article Media</label>
                  <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-cyan-300 rounded-3xl p-8 flex flex-col items-center justify-center bg-white/50 group hover:border-pink-400 hover:bg-pink-50 transition-all cursor-pointer overflow-hidden min-h-[160px] shadow-sm"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} className="h-40 w-full object-cover rounded-2xl shadow-md" alt="Preview" />
                    ) : (
                      <>
                        <div className="bg-cyan-100 p-4 rounded-full mb-4 group-hover:bg-pink-100 transition-colors">
                          <FaImage className="text-cyan-500 text-3xl group-hover:scale-110 group-hover:text-pink-500 transition-all" />
                        </div>
                        <span className="text-[12px] font-bold text-cyan-600 uppercase tracking-widest group-hover:text-pink-600">Upload Media</span>
                        <span className="text-[10px] text-cyan-400 mt-2">Click or drag & drop</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] ml-2">Brief Summary</label>
                  <textarea rows={2} required className={`${inputStyle} resize-none`} placeholder="Summarize the article..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] ml-2">Article Content</label>
                  <textarea rows={6} required className={`${inputStyle} resize-none leading-relaxed`} placeholder="Start writing your story..." value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
                </div>

                <button disabled={isSubmitting} className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-400 hover:via-purple-400 hover:to-cyan-400 text-white font-black py-5 rounded-[25px] shadow-[0_10px_25px_rgba(255,105,180,0.4)] hover:shadow-[0_15px_35px_rgba(255,105,180,0.6)] flex items-center justify-center gap-3 tracking-[0.3em] uppercase text-xs transition-all border border-pink-300 transform hover:-translate-y-1">
                  <FaPaperPlane size={16} /> {isSubmitting ? 'Publishing...' : 'Confirm & Publish'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Articles;