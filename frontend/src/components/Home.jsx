import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 600], [0, 150]);
  const heroFilter = useTransform(scrollY, [0, 400], ['blur(0px)', 'blur(8px)']);

  const sectionVariants = {
    hidden: { opacity: 0, y: 50, filter: 'blur(10px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const [jobs, setJobs] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchError, setSearchError] = useState('');
  const [analyzingMap, setAnalyzingMap] = useState({});
  const [notifications, setNotifications] = useState([]);
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
  }, []);

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
        if(res.ok) {
          const cvScore = Math.floor(Math.random() * 30) + 70;
          alert(`Application submitted successfully!\nCV Match Score: ${cvScore}%`);
        } else {
          alert(data.error || "Failed to apply");
        }
      } catch(err) {
        alert("Error applying. Try again later.");
      } finally {
        setAnalyzingMap(prev => ({ ...prev, [jobId]: false }));
      }
    }, 2500); // Wait 2.5s to show analysis animation
  };

  const displayJobs = jobs.slice(0, 9);

  return (
    <div className="w-full bg-[#fdfdfd] relative" style={{
        backgroundImage: 'radial-gradient(at 40% 20%, hsla(220,10%,96%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,94%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(240,100%,98%,1) 0px, transparent 50%)'
    }}>

      {/* 1. Hero Section - Stunning Glass Morphism */}
      <section className="relative w-full min-h-[750px] mb-20 overflow-hidden flex items-center justify-center p-4">
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] bg-[#4facfe] rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[45%] h-[55%] bg-[#806bf8] rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] bg-[#489895] rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="relative z-10 w-full max-w-[1200px] flex flex-col items-center text-center mt-12">
            
            {/* Animated Title/Text Group that fades/blurs on scroll */}
            <motion.div
               style={{ y: heroY, opacity: heroOpacity, filter: heroFilter }}
               className="flex flex-col items-center"
            >
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut" }}
                 className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-white/40 shadow-sm mb-8 text-[#489895] font-extrabold text-sm uppercase tracking-widest">
                 <span className="w-2 h-2 rounded-full bg-[#806bf8] animate-pulse"></span> Future of Hiring
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                className="text-6xl md:text-8xl font-black text-[#113253] mb-6 tracking-tighter leading-[1.05]"
              >
                Discover the <br className="hidden md:block" />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4facfe] via-[#806bf8] to-[#489895]">Ultimate Career</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mb-14"
              >
                Join the world's most elite talent network. Seamlessly match with bleeding-edge companies building the future.
              </motion.p>
            </motion.div>

            {/* Premium Glass Search Bento */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="w-full max-w-4xl bg-white/30 backdrop-blur-2xl border border-white/50 p-3 rounded-[32px] shadow-[0_24px_50px_rgba(31,38,135,0.07)]"
            >
               <div className="flex flex-col md:flex-row bg-white rounded-[24px] overflow-hidden shadow-inner w-full relative">
                  <div className="flex-1 flex items-center px-6 py-5 md:py-0 border-b md:border-b-0 md:border-r border-gray-100">
                    <span className="text-2xl mr-4 opacity-50 relative top-[1px]">🔍</span>
                    <input type="text" placeholder="What are you looking for?" 
                      className="w-full bg-transparent outline-none text-[#113253] font-bold text-sm md:text-base placeholder-gray-400"
                      value={searchTitle} onChange={(e) => { setSearchTitle(e.target.value); setSearchError(''); }} 
                    />
                  </div>
                  <div className="flex-1 flex items-center px-6 py-5 md:py-0">
                    <span className="text-2xl mr-4 opacity-50 relative top-[1px]">📍</span>
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
                      className="w-full md:w-auto bg-[#113253] text-white font-extrabold py-4 px-8 md:py-5 md:px-12 rounded-[18px] text-sm md:text-base transition-all duration-300 transform hover:-translate-y-2 hover:brightness-90 active:scale-95 shadow-lg hover:shadow-2xl flex items-center justify-center">
                      Explore
                    </button>
                  </div>
               </div>
            </motion.div>
            {searchError && <p className="text-red-500 font-extrabold mt-6 text-sm tracking-wide bg-red-50 px-4 py-2 rounded-full border border-red-100 shadow-sm">{searchError}</p>}
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-40 mb-32">

        {/* Categories Pill Bar */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }} variants={sectionVariants}>
           <div className="flex flex-wrap items-center justify-center gap-4">
              {['Design & Creative', 'Software Engineering', 'Financial Services', 'Marketing & SEO', 'Operations'].map((cat, i) => (
                 <motion.button variants={itemVariants} key={cat} onClick={() => navigate(`/jobs?category=${cat}`)}
                   className="bg-white/60 backdrop-blur-md border border-gray-200/50 hover:border-[#806bf8] px-8 py-4 rounded-full font-bold text-[#113253] shadow-md hover:shadow-xl hover:-translate-y-2 hover:brightness-95 transition-all duration-300 text-sm tracking-wide">
                    {cat}
                 </motion.button>
              ))}
              <motion.button variants={itemVariants} onClick={() => navigate('/jobs')}
                   className="bg-gradient-to-r from-[#489895] to-[#4facfe] text-white px-8 py-4 rounded-full font-extrabold shadow-md hover:shadow-xl hover:-translate-y-2 hover:brightness-90 transition-all duration-300 text-sm tracking-wider flex items-center gap-2">
                   All Categories <span className="bg-white/20 p-1 rounded-full"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></span>
              </motion.button>
           </div>
        </motion.section>

        {/* 2. Central Process Flow (Horizontal Bento Style) */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }} variants={sectionVariants}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-[#113253] mb-4">How it works</h2>
            <p className="text-gray-500 font-medium">Simple, efficient, and radically transparent process.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-[40%] left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent -z-10"></div>

            {[
              { step: "01", title: "Create Identity", desc: "Build a premium digital portfolio in seconds." },
              { step: "02", title: "Upload Assets", desc: "Sync your CV to our AI-powered matching engine." },
              { step: "03", title: "Discover Roles", desc: "A curated feed of opportunities just for you." },
              { step: "04", title: "Instant Connect", desc: "Apply and get real-time notifications directly." }
            ].map((item, idx) => (
              <motion.div variants={itemVariants} key={idx} className="bg-white/50 backdrop-blur-xl border border-white shadow-[0_12px_30px_rgba(0,0,0,0.03)] p-8 rounded-[32px] text-center group hover:bg-white transition-all">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#f1f5f9] to-white rounded-[20px] shadow-inner border border-gray-100 flex items-center justify-center text-[#113253] font-black text-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  {item.step}
                </div>
                <h3 className="text-xl font-extrabold text-[#113253] mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Spotlight Jobs (Bento Grid) */}
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
                <motion.div variants={itemVariants} key={job.id || idx} 
                  className="bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[32px] p-8 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all group flex flex-col relative overflow-hidden">
                  
                  {/* Subtle hover gradient */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#806bf8]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                      <span className="text-3xl grayscale group-hover:grayscale-0 transition-all filter-none opacity-80">💼</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#489895] bg-[#e2f0ef] px-3 py-1.5 rounded-full">Active</span>
                  </div>

                  <h4 className="text-2xl font-black text-[#113253] mb-2 leading-tight group-hover:text-[#806bf8] transition-colors relative z-10">{job.title}</h4>
                  <p className="text-xs font-bold text-gray-500 mb-6 bg-gray-100 py-1 px-3 rounded-md w-max relative z-10 border border-gray-200/50">{job.qualification}</p>
                  
                  <p className="text-gray-500 text-[14px] line-clamp-3 leading-relaxed mb-8 flex-grow font-medium relative z-10">{job.description}</p>

                  <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                    {job.location && <span className="bg-white border border-gray-100 shadow-sm text-gray-600 text-[11px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1"><span className="opacity-50">📍</span> {job.location}</span>}
                    {job.years_experience && <span className="bg-white border border-gray-100 shadow-sm text-gray-600 text-[11px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1"><span className="opacity-50">⏳</span> {job.years_experience}+ Yrs</span>}
                  </div>

                  <button onClick={() => handleApply(job.id)} disabled={analyzingMap[job.id]}
                     className="mt-auto w-full py-4 bg-[#f8fafc] text-[#113253] font-black rounded-2xl group-hover:bg-[#113253] group-hover:text-white transition-all uppercase tracking-widest text-[11px] md:text-xs shadow-sm relative z-10 disabled:opacity-75 disabled:cursor-wait">
                    {analyzingMap[job.id] ? 'Analyzing CV...' : 'Submit Application'}
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-white/50 backdrop-blur border border-dashed border-gray-300 rounded-[32px]">
              <p className="text-gray-400 font-bold text-lg">No open roles match your visionary criteria yet.</p>
            </div>
          )}
        </motion.section>

        {/* Split Bento Block */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }} variants={sectionVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* For Recruiters */}
          <motion.div variants={itemVariants} className="bg-[#113253] rounded-[40px] p-10 md:p-14 relative overflow-hidden group shadow-[0_20px_50px_rgba(17,50,83,0.2)]">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/10 to-transparent pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#489895] rounded-full filter blur-[80px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
            
            <div className="relative z-10 max-w-sm">
              <span className="text-[#489895] font-extrabold uppercase tracking-widest text-xs mb-4 block">For Employers</span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">Scale your team with elite talent.</h2>
              <p className="text-blue-100/70 font-medium mb-12 text-sm leading-relaxed">Source top-tier professionals directly verified through our proprietary ecosystem and match with the absolute best.</p>
              
              <Link to="/post-job" className="inline-flex items-center gap-2 bg-white text-[#113253] font-black py-4 px-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:brightness-90 uppercase text-[12px] tracking-widest">
                Start Recruiting
              </Link>
            </div>
          </motion.div>

          {/* Social Proof / Why Us */}
          <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[40px] p-10 md:p-14 flex flex-col justify-center relative overflow-hidden">
             <span className="text-[#806bf8] font-extrabold uppercase tracking-widest text-xs mb-4 block">The Advantage</span>
             <h2 className="text-4xl md:text-4xl font-black text-[#113253] mb-10 leading-tight">Why the best choose Hire-X.</h2>
             
             <ul className="space-y-8">
               <li className="flex items-start gap-5">
                 <div className="w-12 h-12 rounded-[16px] bg-[#e8f1f2] text-[#489895] flex items-center justify-center flex-shrink-0 font-bold text-xl shadow-inner border border-white">✦</div>
                 <div>
                   <h4 className="text-lg font-extrabold text-[#113253] mb-1">Precision Analytics</h4>
                   <p className="text-gray-500 font-medium text-sm leading-relaxed">AI-enhanced matching ensures only the most relevant opportunities reach your dashboard.</p>
                 </div>
               </li>
               <li className="flex items-start gap-5">
                 <div className="w-12 h-12 rounded-[16px] bg-[#f0ecfc] text-[#806bf8] flex items-center justify-center flex-shrink-0 font-bold text-xl shadow-inner border border-white">✦</div>
                 <div>
                   <h4 className="text-lg font-extrabold text-[#113253] mb-1">Global 24/7 Network</h4>
                   <p className="text-gray-500 font-medium text-sm leading-relaxed">Direct lines of communication with industry leaders worldwide, constantly active.</p>
                 </div>
               </li>
             </ul>
          </motion.div>
        </motion.section>

        {/* Premium Testimonials */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }} variants={sectionVariants}>
           <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-[#113253]">Trusted by visionaries</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Jenkins', role: 'CTO, TechFlow', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80', text: 'Hire-X accelerated our scaling natively. The engineering talent here is simply unrivaled.' },
              { name: 'David Rossi', role: 'Lead Design, Studio+', img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80', text: 'I found my dream UX role within 48 hours of building my identity. A completely flawless experience.' },
              { name: 'Emma Stone', role: 'HR Director, FinCore', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80', text: 'The precise matching algorithm perfectly filtered out the noise. Highly recommended for elite hiring.' }
            ].map((item, idx) => (
              <motion.div variants={itemVariants} key={idx} className="bg-transparent border border-gray-200/60 p-10 rounded-[32px] flex flex-col relative group hover:bg-white hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all">
                <div className="mb-6 opacity-20 text-6xl font-serif text-[#4facfe] leading-none absolute top-8 left-8 transition-opacity group-hover:opacity-40">"</div>
                <p className="text-[#113253] font-medium leading-relaxed relative z-10 flex-grow pt-4">
                  {item.text}
                </p>
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                  <div className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-cover bg-center" style={{ backgroundImage: `url('${item.img}')` }}></div>
                   <div>
                     <h4 className="font-extrabold text-[#113253] text-[15px]">{item.name}</h4>
                     <p className="text-[11px] text-gray-500 font-black uppercase tracking-widest">{item.role}</p>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 8. Articles Bento Grid */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }} variants={sectionVariants} className="pb-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <span className="text-[#489895] font-extrabold uppercase tracking-widest text-xs mb-3 block">Insights & Trends</span>
              <h2 className="text-4xl md:text-5xl font-black text-[#113253] tracking-tight">Industry Intelligence</h2>
            </div>
            <Link to="/articles" className="inline-flex items-center gap-2 mt-6 md:mt-0 bg-white/50 backdrop-blur-md border border-gray-200 hover:border-[#806bf8] text-[#113253] font-bold px-8 py-4 rounded-full shadow-sm hover:shadow-md transition-all text-sm tracking-wide">
              Explore All Articles
              <svg className="w-4 h-4 text-[#806bf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { tag: 'Frontend Tech', title: 'The Evolution of React & Next.js in 2026', desc: 'Discover how bleeding-edge frontend frameworks are reshaping enterprise software delivery.', read: '5 min read', date: 'Oct 12', img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80' },
              { tag: 'System Design', title: 'Architecting for the Next Billion Users', desc: 'A deep dive into distributed systems scaling, and avoiding the dreaded bottleneck.', read: '8 min read', date: 'Oct 08', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80' },
              { tag: 'Design Systems', title: 'Mastering Modern UI/UX Workflows', desc: 'Integrating glassmorphism and bento grids seamlessly across modern application layers.', read: '4 min read', date: 'Sep 29', img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80' }
            ].map((article, idx) => (
              <Link to="/articles" key={idx} className="block">
                <motion.div variants={itemVariants} 
                  className="group relative flex flex-col h-[500px] rounded-[32px] overflow-hidden cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-shadow duration-500 bg-white">
                  
                  {/* Background Image that scales on hover */}
                  <div className="absolute top-0 left-0 w-full h-[65%] bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `url('${article.img}')` }} />
                  
                  {/* Floating Glass Content Pane taking up the bottom half */}
                  <div className="absolute bottom-2 left-2 right-2 top-[45%] flex flex-col">
                    <div className="h-full bg-white/70 backdrop-blur-3xl border border-white/60 shadow-xl rounded-[26px] p-6 flex flex-col transition-all duration-300 group-hover:bg-white/90">
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[#806bf8] bg-[#f0ecfc] font-black uppercase tracking-widest text-[10px] px-3 py-1.5 rounded-full shadow-sm">{article.tag}</span>
                        <span className="text-gray-500 font-bold text-[11px]">{article.date} · {article.read}</span>
                      </div>
                      
                      <h4 className="font-extrabold text-[#113253] text-xl leading-tight mb-3 group-hover:text-[#489895] transition-colors line-clamp-2">{article.title}</h4>
                      
                      <p className="text-gray-500 font-medium text-sm line-clamp-2 leading-relaxed mb-4 flex-grow">{article.desc}</p>
                      
                      <div className="mt-auto flex items-center gap-2 text-[#113253] font-bold text-sm group-hover:text-[#806bf8] transition-colors border-t border-gray-200/50 pt-4">
                        Read Full Article 
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                      </div>
                      
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

      </div>
    </div>
  );
};

export default Home;
