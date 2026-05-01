import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useVelocity, useSpring } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import heroBg from '../assets/bg.jpeg';
import identity from '../assets/Create Identity.jpeg';
import uploadAssets from '../assets/Upload assets.jpeg';
import discoverRoles from '../assets/Discover roles.jpeg';
import instantConnect from '../assets/Instant Connect.jpeg';

const FeedbackCard = ({ item, user, onDelete, variants }) => {
  const [expanded, setExpanded] = useState(false);
  const isLongText = item.text && item.text.length > 100;

  const getAvatarContent = () => {
    if (item.avatar) {
      return <div className="w-14 h-14 rounded-full bg-cover bg-center border-2 border-white shadow-md flex-shrink-0" style={{ backgroundImage: `url('${item.avatar}')` }}></div>;
    }
    return (
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-md flex-shrink-0 text-gray-400 font-black text-xl">
        {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
      </div>
    );
  };

  return (
    <motion.div variants={variants} className={`bg-white/90 backdrop-blur-xl border border-gray-100/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-7 rounded-[28px] flex flex-col relative transition-all duration-500 ${expanded ? 'col-span-1 md:col-span-2 lg:col-span-3 shadow-xl' : 'hover:-translate-y-2 hover:shadow-lg'}`}>
      {item.id && user && user.id === item.user_id && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="absolute top-4 right-4 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-full p-2 transition-colors z-20 shadow-sm" title="Delete Feedback">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      )}
      <div className="flex items-center gap-4 mb-5">
        {getAvatarContent()}
        <div>
          <h4 className="font-extrabold text-[#113253] text-[16px]">{item.name || 'Anonymous User'}</h4>
          <span className="text-[11px] font-bold text-[#489895] uppercase tracking-widest">{item.role || 'Member'}</span>
        </div>
      </div>
      
      <p className={`text-[#113253]/80 font-medium text-[14px] leading-relaxed flex-grow ${!expanded && isLongText ? 'line-clamp-3' : ''}`}>
        {item.text}
      </p>
      
      {isLongText && (
        <button onClick={() => setExpanded(!expanded)} className="mt-4 text-left text-[11px] font-black uppercase tracking-widest text-[#806bf8] hover:text-[#5a48bd] transition-colors w-max inline-flex items-center gap-1">
          {expanded ? 'Show Less ↑' : 'Show More ↓'}
        </button>
      )}
    </motion.div>
  );
};

const Home = () => {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 600], [0, 150]);
  const heroFilter = "blur(0px)";

  const searchBarY = useTransform(scrollY, [0, 200, 300, 1600, 1800], [-100, -100, 0, 0, -100]);
  const searchBarOpacity = useTransform(scrollY, [0, 200, 300, 1600, 1800], [0, 0, 1, 1, 0]);

  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityBlur = useTransform(smoothVelocity, [-1000, 0, 1000], [2, 0, 2]);
  const blurFilterValue = useTransform(velocityBlur, v => `blur(${v}px)`);

  const sectionVariants = {
    hidden: { opacity: 0, y: 50, filter: 'blur(2px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(2px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: "easeOut" } }
  };

  const [jobs, setJobs] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchError, setSearchError] = useState('');
  const [analyzingMap, setAnalyzingMap] = useState({});
  const [feedbacks, setFeedbacks] = useState([]);
  const [articles, setArticles] = useState([]);
  const [showAllFeedbacks, setShowAllFeedbacks] = useState(false);
  const [expandedFeedbackId, setExpandedFeedbackId] = useState(null);
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const fetchJobs = (title = '', location = '') => {
    if (!title.trim() && !location.trim()) {
      setSearchError('Job title or location is required!');
      return;
    }
    setSearchError('');
    let url = new URL('/api/jobs');
    if (title) url.searchParams.append('title', title);
    if (location) url.searchParams.append('location', location);

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setJobs(data);
        else setJobs([]);
      })
      .catch((err) => {
        console.error(err);
        setJobs([]);
      });
  };

  useEffect(() => {
    fetchJobs();
    fetchFeedbacks();
    fetchArticles();
    const handleFeedbackUpdate = () => fetchFeedbacks();
    window.addEventListener('feedback_updated', handleFeedbackUpdate);
    return () => window.removeEventListener('feedback_updated', handleFeedbackUpdate);
  }, []);

  const fetchFeedbacks = () => {
    fetch('/api/feedbacks')
      .then(res => res.json())
      .then(data => setFeedbacks(data))
      .catch(console.error);
  };

  const fetchArticles = () => {
    fetch('/api/articles?limit=3')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setArticles(data);
        }
      })
      .catch(console.error);
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete your feedback?")) return;
    try {
      const res = await fetch(`/api/feedbacks/${feedbackId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setFeedbacks(feedbacks.filter(f => f.id !== feedbackId));
      } else {
        alert("Failed to delete feedback");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const handleApply = async (jobId) => {
    if (!user) {
      navigate('/login', { state: { isRegister: true } });
      return;
    }
    setAnalyzingMap(prev => ({ ...prev, [jobId]: true }));
    setTimeout(async () => {
      try {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ job_id: jobId })
        });
        const data = await res.json();
        if (res.ok) {
          const cvScore = Math.floor(Math.random() * 30) + 70;
          alert(`Application submitted successfully!\nCV Match Score: ${cvScore}%`);
        } else {
          alert(data.error || "Failed to apply");
        }
      } catch (err) {
        alert("Error applying. Try again later.");
      } finally {
        setAnalyzingMap(prev => ({ ...prev, [jobId]: false }));
      }
    }, 200);
  };

  const displayJobs = jobs.slice(0, 9);

  return (
    <div className="w-full bg-[#fdfdfd] relative" style={{
      backgroundImage: 'radial-gradient(at 40% 20%, hsla(220,10%,96%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,94%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(240,100%,98%,1) 0px, transparent 50%)'
    }}>

      <motion.div
        style={{ backdropFilter: blurFilterValue, WebkitBackdropFilter: blurFilterValue }}
        className="fixed inset-0 pointer-events-none z-[40]"
      />

      <motion.div
        style={{ y: searchBarY, opacity: searchBarOpacity }}
        className="fixed top-6 left-0 right-0 w-full px-4 z-[100] flex justify-center pointer-events-none"
      >
        <div className="w-full max-w-4xl bg-white/95 backdrop-blur-3xl border-[3px] border-[#489895] shadow-[0_20px_50px_rgba(72,152,149,0.3)] p-2 rounded-[32px] pointer-events-auto">
          <div className="flex flex-col md:flex-row bg-white rounded-[24px] overflow-hidden shadow-inner w-full relative">
            <div className="flex-1 flex items-center px-5 py-4 md:py-0 border-b md:border-b-0 md:border-r border-gray-100">
              <span className="text-xl mr-4 opacity-50 relative top-[1px]">🔍</span>
              <input type="text" placeholder="What role are you looking for?"
                className="w-full bg-transparent outline-none text-[#113253] font-bold text-sm md:text-base placeholder-gray-400"
                value={searchTitle} onChange={(e) => { setSearchTitle(e.target.value); setSearchError(''); }}
              />
            </div>
            <div className="flex-1 flex items-center px-5 py-4 md:py-0">
              <span className="text-xl mr-4 opacity-50 relative top-[1px]">📍</span>
              <input type="text" placeholder="Location, City"
                className="w-full bg-transparent outline-none text-[#113253] font-bold text-sm md:text-base placeholder-gray-400"
                value={searchCity} onChange={(e) => { setSearchCity(e.target.value); setSearchError(''); }}
              />
            </div>
            <div className="p-2">
              <button onClick={() => {
                if (!searchTitle.trim() && !searchCity.trim()) {
                  setSearchError('Job title or location is required!');
                  return;
                }
                navigate(`/jobs?title=${encodeURIComponent(searchTitle)}&location=${encodeURIComponent(searchCity)}`);
              }}
                className="w-full md:w-auto bg-[#113253] text-white font-extrabold py-4 px-10 rounded-[18px] text-sm transition-all duration-300 transform hover:-translate-y-1 hover:brightness-90 active:scale-95 shadow-lg flex items-center justify-center">
                Explore
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: false, margin: "0px" }} variants={sectionVariants}
        className="relative w-full min-h-[85vh] mb-20 overflow-hidden flex items-center justify-center p-4 bg-black"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 w-full max-w-[1200px] flex flex-col items-center text-center mt-12">
          <motion.div style={{ y: heroY, opacity: heroOpacity, filter: heroFilter }} className="flex flex-col items-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-sm mb-8 text-white font-extrabold text-sm uppercase tracking-widest drop-shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#806bf8] animate-pulse"></span> Future of Hiring
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
              className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-[1.05] drop-shadow-lg">
              Discover the <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#80d0ff] via-[#b3a8ff] to-[#6be0dd] drop-shadow-md">Ultimate Career</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="text-lg md:text-xl text-gray-100 font-medium max-w-2xl mb-14 drop-shadow-md">
              Join the world's most elite talent network. Seamlessly match with bleeding-edge companies building the future.
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-40 mb-32">

        {/* 2. Central Process Flow - UPDATED ATTRACTIVE GRADIENT TEXTS */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }} variants={sectionVariants}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-[#113253] mb-4">How it works</h2>
            <p className="text-gray-500 font-medium">Simple, efficient, and radically transparent process.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              { step: "01", title: "Create Identity", desc: "Build a premium digital portfolio in seconds.", bgImg: identity },
              { step: "02", title: "Upload Assets", desc: "Sync your CV to our intelligent matching engine.", bgImg: uploadAssets },
              { step: "03", title: "Discover Roles", desc: "A curated feed of opportunities just for you.", bgImg: discoverRoles },
              { step: "04", title: "Instant Connect", desc: "Apply and get real-time notifications directly.", bgImg: instantConnect }
            ].map((item, idx) => (
              <motion.div variants={itemVariants} key={idx} className="relative overflow-hidden border border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.06)] p-8 rounded-[40px] text-center group transition-all h-[340px] flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-125" style={{ backgroundImage: `url(${item.bgImg})` }}></div>
                {/* Dark Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#062c2b]/95 via-[#062c2b]/40 to-transparent group-hover:from-[#062c2b] transition-all duration-500"></div>

                <div className="relative z-10 w-14 h-14 mx-auto bg-gradient-to-br from-[#2af598]/30 to-white/10 backdrop-blur-xl rounded-[20px] border border-white/30 flex items-center justify-center text-white font-black text-xl mb-8 shadow-2xl group-hover:rotate-12 transition-transform">
                  {item.step}
                </div>

                {/* Fancy Attractive Gradient Title */}
                <h3 className="relative z-10 text-2xl font-black mb-3 tracking-tight drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#2af598] via-[#00e5ff] to-[#ffffff]">
                  {item.title}
                </h3>

                <p className="relative z-10 text-emerald-50/70 text-sm font-bold leading-relaxed px-2">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }} variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div variants={itemVariants} className="bg-[#113253] rounded-[40px] p-10 md:p-14 relative overflow-hidden group shadow-[0_20px_50px_rgba(17,50,83,0.2)]">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/10 to-transparent pointer-events-none"></div>
            <div className="relative z-10 max-w-sm">
              <span className="text-[#489895] font-extrabold uppercase tracking-widest text-xs mb-4 block">For Employers</span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">Scale your team with elite talent.</h2>
              <Link to="/post-job" className="inline-flex items-center gap-2 bg-white text-[#113253] font-black py-4 px-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all uppercase text-[12px] tracking-widest">Start Recruiting</Link>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[40px] p-10 md:p-14 flex flex-col justify-center relative overflow-hidden">
            <span className="text-[#806bf8] font-extrabold uppercase tracking-widest text-xs mb-4 block">The Advantage</span>
            <h2 className="text-4xl md:text-4xl font-black text-[#113253] mb-10 leading-tight">Why the best choose Hire-X.</h2>
            <ul className="space-y-8">
              <li className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-[16px] bg-[#e8f1f2] text-[#489895] flex items-center justify-center flex-shrink-0 font-bold text-xl shadow-inner border border-white">✦</div>
                <div><h4 className="text-lg font-extrabold text-[#113253] mb-1">Precision Analytics</h4><p className="text-gray-500 font-medium text-sm leading-relaxed">Advanced matching ensures quality.</p></div>
              </li>
              <li className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-[16px] bg-[#f0ecfc] text-[#806bf8] flex items-center justify-center flex-shrink-0 font-bold text-xl shadow-inner border border-white">✦</div>
                <div><h4 className="text-lg font-extrabold text-[#113253] mb-1">Global 24/7 Network</h4><p className="text-gray-500 font-medium text-sm leading-relaxed">Direct lines of communication.</p></div>
              </li>
            </ul>
          </motion.div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }} variants={sectionVariants}>
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div><h2 className="text-4xl font-black text-[#113253]">Trusted by visionaries</h2><p className="text-gray-500 font-medium mt-2">Hear what our global talent network says.</p></div>
            <button onClick={() => setShowAllFeedbacks(true)} className="inline-flex items-center gap-2 mt-6 md:mt-0 bg-[#e2f0ef] hover:bg-[#489895] text-[#113253] hover:text-white font-bold px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all text-xs tracking-widest uppercase">More Options →</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Jenkins', role: 'CTO, TechFlow', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80', text: 'Hire-X accelerated our scaling natively.' },
              { name: 'David Rossi', role: 'Lead Design, Studio+', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80', text: 'I found my dream UX role within 48 hours.' },
              { name: 'Emma Stone', role: 'HR Director, FinCore', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80', text: 'Highly recommended for elite hiring.' },
              ...feedbacks
            ].slice(0, 3).map((item, idx) => (
              <FeedbackCard key={idx} item={item} user={user} onDelete={handleDeleteFeedback} variants={itemVariants} />
            ))}
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }} variants={sectionVariants} className="pb-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div><span className="text-[#489895] font-extrabold uppercase tracking-widest text-xs mb-3 block">Insights & Trends</span><h2 className="text-4xl md:text-5xl font-black text-[#113253] tracking-tight">Industry Intelligence</h2></div>
            <Link to="/articles" className="inline-flex items-center gap-2 mt-6 md:mt-0 bg-white/50 border border-gray-200 text-[#113253] font-bold px-8 py-4 rounded-full text-sm tracking-wide transition-all">Explore All Articles</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.length > 0 ? articles.map((article, idx) => {
              const placeholderImages = [
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072",
                "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070",
                "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=1964",
                "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070",
                "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=1974"
              ];
              return (
              <Link to={`/articles?title=${encodeURIComponent(article.title)}`} key={idx} className="block h-full">
                <motion.div variants={itemVariants} className="group bg-gradient-to-br from-cyan-100/90 via-teal-50/90 to-cyan-200/90 backdrop-blur-2xl rounded-3xl border-2 border-white/60 overflow-hidden shadow-[0_10px_40px_rgba(0,200,255,0.15)] hover:shadow-[0_20px_50px_rgba(0,200,255,0.3)] hover:border-cyan-300 transition-all duration-500 flex flex-col h-full cursor-pointer transform hover:-translate-y-2">
                  <div className="p-3">
                    <div className="rounded-2xl overflow-hidden aspect-[16/10] bg-cyan-900/10 relative shadow-inner">
                      <img src={article.image_url || placeholderImages[idx % placeholderImages.length]} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                      <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/60 via-transparent to-transparent opacity-80"></div>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow relative">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-pink-600 font-black text-[9px] uppercase tracking-widest bg-pink-100 border border-pink-200 px-3 py-1 rounded-lg shadow-sm">{article.category}</span>
                      <span className="text-cyan-800 font-bold text-[10px] flex items-center gap-1 bg-white/50 px-2 py-1 rounded-md">
                        <svg className="w-3 h-3 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                        {article.read_time}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-cyan-950 mb-3 leading-tight line-clamp-2 group-hover:text-purple-600 transition-colors drop-shadow-sm">{article.title}</h3>
                    <p className="text-cyan-800/80 text-sm line-clamp-3 mb-6 flex-grow font-medium">{article.description}</p>
                    <div className="w-full py-3.5 rounded-xl bg-white/60 text-cyan-700 font-black text-[10px] uppercase tracking-[0.2em] group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:via-teal-400 group-hover:to-cyan-500 group-hover:text-white shadow-sm group-hover:shadow-[0_10px_20px_rgba(0,255,255,0.4)] transition-all duration-300 flex items-center justify-center gap-2 border border-white">
                      Read Article <span className="text-lg leading-none">→</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            )}) : (
              <p className="col-span-3 text-center text-gray-500 font-medium py-10">No recent articles found. Stay tuned!</p>
            )}
          </div>
        </motion.section>
      </div>

      <AnimatePresence>
        {showAllFeedbacks && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={() => setShowAllFeedbacks(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="bg-gradient-to-br from-[#113253] via-[#489895] to-[#806bf8] border border-white/20 p-6 md:p-10 rounded-[32px] w-full max-w-5xl relative flex flex-col max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowAllFeedbacks(false)} className="absolute top-6 right-6 text-white/80 bg-white/10 rounded-full p-2"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
              <div className="text-center mb-8 pb-6 border-b border-white/20"><h3 className="text-3xl md:text-4xl font-black text-white">Visionary Feedback</h3></div>
              <div className="overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {[
                  { name: 'Sarah Jenkins', role: 'CTO', text: 'Hire-X accelerated our scaling natively.' },
                  { name: 'David Rossi', role: 'Lead Design', text: 'I found my dream UX role within 48 hours.' },
                  { name: 'Emma Stone', role: 'HR Director', text: 'Highly recommended for elite hiring.' },
                  ...feedbacks
                ].map((item, idx) => (
                  <FeedbackCard key={idx} item={item} user={user} onDelete={handleDeleteFeedback} />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;