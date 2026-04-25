import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import {
  FaPen, FaTrash, FaTimes, FaArrowRight, FaCloudUploadAlt,
  FaBookOpen, FaPaperPlane, FaClock, FaImage
} from 'react-icons/fa';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
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
  const isMainAdmin = user && user.role === 'main_admin';

  // Fetch articles from API
  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      console.error("Failed to fetch articles", err);
    }
  };

  useEffect(() => { fetchArticles(); }, []);

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

  // Background decoration (Soft Green accents)
  const NatureDecor = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
      <motion.div animate={{ rotate: [0, 5, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute -left-10 top-0">
        <svg width="300" height="600" viewBox="0 0 100 200" fill="none" className="text-emerald-300">
          <path d="M10 0C10 50 40 80 10 130C-20 180 10 200 10 200" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
          <circle cx="15" cy="40" r="8" fill="currentColor" />
        </svg>
      </motion.div>
    </div>
  );

  const inputStyle = "w-full bg-white border border-cyan-100 rounded-2xl py-4 px-6 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 font-bold text-gray-700 transition-all";

  return (
    <div className="w-full bg-[#f0f9f6] min-h-screen relative overflow-hidden pb-32 font-sans">
      <NatureDecor />

      <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="bg-white border border-emerald-100 text-emerald-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-sm mb-6 inline-block">
            Deep Dive Into Tech
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-[#1a2e29] mb-8 tracking-tighter">
            Digital <span className="text-emerald-600 italic">Journal</span>
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
              className="bg-[#183c31] text-white px-12 py-4 rounded-[20px] font-bold shadow-xl flex items-center gap-3 mx-auto text-xs uppercase tracking-widest"
            >
              + Create New Post
            </motion.button>
          )}
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-20">
          {['All', 'Interview Tips', 'Career Guidance', 'Tech News'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all border ${filter === cat ? 'bg-emerald-600 text-white border-transparent shadow-lg' : 'bg-white text-emerald-300 border-emerald-50 hover:bg-emerald-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredArticles.map((article, index) => (
            <motion.div layout key={article.id} className="group bg-white/80 backdrop-blur-md rounded-[40px] border border-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-2xl transition-all h-full flex flex-col">
              <div className="h-56 w-full rounded-[30px] overflow-hidden relative cursor-pointer" onClick={() => setSelectedArticle(article)}>
                <img src={article.image_url || placeholderImages[index % placeholderImages.length]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent"></div>
                {isMainAdmin && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setEditMode(true); setFormData(article); setImagePreview(article.image_url); setShowAdminModal(true); }} className="bg-white/90 p-2 rounded-xl text-cyan-600 shadow-sm hover:text-cyan-400"><FaPen size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(article.id); }} className="bg-white/90 p-2 rounded-xl text-red-400 shadow-sm hover:text-red-500"><FaTrash size={14} /></button>
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-emerald-600 font-black text-[9px] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">{article.category}</span>
                  <span className="text-gray-300 font-bold text-[9px] flex items-center gap-1"><FaClock /> {article.read_time}</span>
                </div>
                <h3 className="text-xl font-black text-[#1a2e29] mb-3 leading-tight line-clamp-2 cursor-pointer" onClick={() => setSelectedArticle(article)}>{article.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-grow">{article.description}</p>
                <button onClick={() => setSelectedArticle(article)} className="w-full py-4 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2">
                  Read More <FaArrowRight />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reader Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-900/20 backdrop-blur-xl" onClick={() => setSelectedArticle(null)}>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl bg-white rounded-[50px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
              <div className="h-72 w-full relative">
                <img src={selectedArticle.image_url || placeholderImages[0]} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setSelectedArticle(null)} className="absolute top-6 right-6 w-12 h-12 bg-white/90 rounded-2xl flex items-center justify-center text-emerald-600 hover:bg-white shadow-lg"><FaTimes /></button>
              </div>
              <div className="p-8 md:p-16 overflow-y-auto">
                <div className="flex items-center gap-4 mb-6">
                  <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest">{selectedArticle.category}</span>
                  <span className="text-gray-400 font-bold text-xs">{selectedArticle.read_time}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-[#1a2e29] mb-8 leading-tight">{selectedArticle.title}</h2>
                <div className="text-gray-600 text-lg leading-relaxed whitespace-pre-line font-medium border-t border-emerald-50 pt-8">
                  {selectedArticle.content || selectedArticle.description}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Post Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-emerald-950/20 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-3xl bg-white rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.1)] overflow-hidden">
              <div className="bg-[#183c31] p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-xl text-white"><FaBookOpen size={24} /></div>
                  <div>
                    <h3 className="text-white font-black uppercase tracking-widest text-sm">{editMode ? 'Edit Article' : 'Create Article'}</h3>
                    <p className="text-cyan-200/60 text-[10px] font-bold">Manage your journal entries</p>
                  </div>
                </div>
                <button onClick={() => setShowAdminModal(false)} className="text-white/60 hover:text-white"><FaTimes size={20} /></button>
              </div>

              <form onSubmit={handleAdminSubmit} className="p-10 space-y-6 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Article Title</label>
                    <input type="text" required className={inputStyle} placeholder="Main Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Category</label>
                    <select className={inputStyle} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                      <option value="Tech News">Tech News</option>
                      <option value="Interview Tips">Interview Tips</option>
                      <option value="Career Guidance">Career Guidance</option>
                    </select>
                  </div>
                </div>

                {/* Image Upload Logic */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Article Media</label>
                  <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-cyan-100 rounded-2xl p-6 flex flex-col items-center justify-center bg-cyan-50/20 group hover:border-cyan-400 transition-all cursor-pointer overflow-hidden min-h-[150px]"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} className="h-32 w-full object-cover rounded-xl" alt="Preview" />
                    ) : (
                      <>
                        <FaImage className="text-cyan-300 text-3xl mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-bold text-cyan-600 uppercase tracking-widest">Upload From Media</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Brief Summary</label>
                  <textarea rows={2} required className={`${inputStyle} resize-none`} placeholder="Summarize the article..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Article Content</label>
                  <textarea rows={6} required className={`${inputStyle} resize-none leading-relaxed`} placeholder="Start writing your story..." value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
                </div>

                <button disabled={isSubmitting} className="w-full bg-[#183c31] hover:bg-[#122e26] text-white font-black py-5 rounded-[25px] shadow-xl flex items-center justify-center gap-3 tracking-[0.3em] uppercase text-[11px] transition-all">
                  <FaPaperPlane /> {isSubmitting ? 'Publishing...' : 'Confirm & Publish'}
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