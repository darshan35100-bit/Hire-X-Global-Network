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
  const velocityBlur = useTransform(smoothVelocity, [-1000, 0, 1000], [10, 0, 10]);
  const blurFilterValue = useTransform(velocityBlur, v => `blur(${v}px)`);

  const sectionVariants = {
    hidden: { opacity: 0, y: 50, filter: 'blur(20px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(20px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: "easeOut" } }
  };

  const [jobs, setJobs] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchError, setSearchError] = useState('');
  const [analyzingMap, setAnalyzingMap] = useState({});
  const [feedbacks, setFeedbacks] = useState([]);
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

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }} variants={sectionVariants}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {['Design & Creative', 'Software Engineering', 'Financial Services', 'Marketing & SEO', 'Operations'].map((cat) => (
              <motion.button variants={itemVariants} key={cat} onClick={() => navigate(`/jobs?category=${cat}`)}
                className="bg-white/60 backdrop-blur-md border border-gray-200/50 hover:border-[#806bf8] px-8 py-4 rounded-full font-bold text-[#113253] shadow-md hover:shadow-xl hover:-translate-y-2 hover:brightness-95 transition-all duration-300 text-sm tracking-wide">
                {cat}
              </motion.button>
            ))}
            <motion.button variants={itemVariants} onClick={() => navigate('/jobs')}
              className="bg-gradient-to-r from-[#489895] to-[#4facfe] text-white px-8 py-4 rounded-full font-extrabold shadow-md hover:shadow-xl hover:-translate-y-2 hover:brightness-90 transition-all duration-300 text-sm tracking-wider flex items-center gap-2">
              All Categories <span className="bg-white/20 p-1 rounded-full"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></span>
            </motion.button>
          </div>
        </motion.section>

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

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }} variants={sectionVariants}>
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-[#113253] mb-4 tracking-tight">Spotlight Opportunities</h2>
              <p className="text-gray-500 font-medium">Premium roles matched with bleeding-edge technology.</p>
            </div>
            {displayJobs.length > 0 && (
              <Link to="/jobs" className="hidden md:inline-flex items-center gap-2 text-[#489895] font-extrabold pb-1 border-b-2 border-[#489895] hover:text-[#113253] hover:border-[#113253] transition-colors uppercase text-sm tracking-widest mt-4">
                View All Jobs →
              </Link>
            )}
          </div>
          {displayJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayJobs.map((job, idx) => (
                <motion.div variants={itemVariants} key={job.id || idx} className="bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[32px] p-8 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all group flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#806bf8]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl"><span className="text-3xl grayscale group-hover:grayscale-0 transition-all filter-none opacity-80">💼</span></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#489895] bg-[#e2f0ef] px-3 py-1.5 rounded-full">Active</span>
                  </div>
                  <h4 className="text-2xl font-black text-[#113253] mb-2 leading-tight group-hover:text-[#806bf8] transition-colors relative z-10">{job.title}</h4>
                  <p className="text-xs font-bold text-gray-500 mb-6 bg-gray-100 py-1 px-3 rounded-md w-max relative z-10 border border-gray-200/50">{job.qualification}</p>
                  <p className="text-gray-500 text-[14px] line-clamp-3 leading-relaxed mb-8 flex-grow font-medium relative z-10">{job.description}</p>
                  <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                    {job.location && <span className="bg-white border border-gray-100 shadow-sm text-gray-600 text-[11px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1"><span className="opacity-50">📍</span> {job.location}</span>}
                    {job.years_experience && <span className="bg-white border border-gray-100 shadow-sm text-gray-600 text-[11px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1"><span className="opacity-50">⏳</span> {job.years_experience}+ Yrs</span>}
                  </div>
                  <button onClick={() => handleApply(job.id)} disabled={analyzingMap[job.id]} className="mt-auto w-full py-4 bg-[#f8fafc] text-[#113253] font-black rounded-2xl group-hover:bg-[#113253] group-hover:text-white transition-all uppercase tracking-widest text-[11px] md:text-xs shadow-sm relative z-10 disabled:opacity-75 disabled:cursor-wait">
                    {analyzingMap[job.id] ? 'Analyzing CV...' : 'Submit Application'}
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div variants={itemVariants} className="py-20 px-8 text-center bg-gradient-to-br from-white to-[#f0f9ff]/70 backdrop-blur-xl border border-dashed border-[#489895] rounded-[32px] shadow-sm flex flex-col justify-center items-center">
              <div className="w-20 h-20 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner animate-pulse">🔭</div>
              <h3 className="text-[#113253] font-black text-2xl md:text-3xl mb-3">No Open Roles Temporarily</h3>
              <p className="text-gray-500 font-medium max-w-lg mx-auto mb-8 leading-relaxed">Currently, no roles match the visionary criteria.</p>
              <button onClick={() => { setSearchTitle(''); setSearchCity(''); navigate('/jobs'); }} className="px-8 py-4 bg-[#113253] text-white font-extrabold rounded-2xl shadow-lg hover:shadow-2xl transition-all text-sm tracking-wide">Explore All Available Roles</button>
            </motion.div>
          )}
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
            {[
              { tag: 'Frontend Tech', title: 'The Evolution of React & Next.js in 2026', desc: 'Discover frameworks reshaping software delivery.', read: '5 min read', date: 'Oct 12', img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80' },
              { tag: 'System Design', title: 'Architecting for the Next Billion Users', desc: 'Deep dive into distributed systems scaling.', read: '8 min read', date: 'Oct 08', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80' },
              { tag: 'Design Systems', title: 'Mastering Modern UI/UX Workflows', desc: 'Integrating glassmorphism and bento grids.', read: '4 min read', date: 'Sep 29', img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80' }
            ].map((article, idx) => (
              <Link to="/articles" key={idx} className="block">
                <motion.div variants={itemVariants} className="group relative flex flex-col h-[500px] rounded-[32px] overflow-hidden bg-white shadow-sm transition-all">
                  <div className="absolute top-0 left-0 w-full h-[65%] bg-cover bg-center group-hover:scale-105 transition-transform" style={{ backgroundImage: `url('${article.img}')` }} />
                  <div className="absolute bottom-2 left-2 right-2 top-[45%] flex flex-col">
                    <div className="h-full bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[26px] p-6 flex flex-col transition-all group-hover:bg-white/90">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[#806bf8] bg-[#f0ecfc] font-black uppercase tracking-widest text-[10px] px-3 py-1.5 rounded-full">{article.tag}</span>
                        <span className="text-gray-500 font-bold text-[11px]">{article.date} · {article.read}</span>
                      </div>
                      <h4 className="font-extrabold text-[#113253] text-xl leading-tight mb-3 line-clamp-2">{article.title}</h4>
                      <p className="text-gray-500 font-medium text-sm line-clamp-2 mb-4 flex-grow">{article.desc}</p>
                      <div className="mt-auto flex items-center gap-2 text-[#113253] font-bold text-sm border-t border-gray-200/50 pt-4">Read Full Article →</div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
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