import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

const PageWrapper = ({ title, children, bgColor = "bg-white" }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`min-h-screen ${bgColor} py-12 px-4 sm:px-6 lg:px-8 font-sans transition-all duration-700`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-5xl mx-auto"
      >
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-10 bg-white/40 backdrop-blur-2xl p-5 rounded-[32px] border border-white/40 shadow-2xl">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-[#113253] font-black uppercase tracking-[0.2em] text-[11px] hover:text-[#489895] transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#489895]/20 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </div>
            Back
          </button>
          
          <div className="hidden md:flex items-center gap-3">
             <div className="h-1.5 w-1.5 rounded-full bg-[#113253]/20"></div>
             <div className="h-1.5 w-1.5 rounded-full bg-[#113253]/40 animate-pulse"></div>
             <div className="h-1.5 w-1.5 rounded-full bg-[#113253]/20"></div>
          </div>
          
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-[#113253] font-black uppercase tracking-[0.2em] text-[11px] hover:text-red-600 transition-all group"
          >
            Close
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-red-400/20 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
          </button>
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-[#113253] mb-16 tracking-tighter text-center drop-shadow-sm">
          {title}
        </h1>
        
        <div className="bg-white/95 backdrop-blur-xl border border-white rounded-[60px] p-10 md:p-16 text-gray-800 leading-relaxed text-lg shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-black/5 to-transparent pointer-events-none rounded-bl-full"></div>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export const OurStory = () => (
  <PageWrapper title="Our Story" bgColor="bg-gradient-to-br from-[#e2f0ef] via-[#c4e8e6] to-[#e2f0ef]">
    <div className="space-y-8">
      <p className="text-2xl font-bold text-[#113253] leading-snug">
        Founded in <span className="text-[#489895] text-4xl font-black italic">2026</span>, Hire-X Global Network was born from a radical ambition: to synchronize the world's most talented minds with its most significant challenges.
      </p>
      <p>
        In an era of rapid technological displacement, we recognized that the traditional bridge between talent and opportunity was crumbling. We didn't just want to fix it; we wanted to rebuild it using the very tools that were redefining our world.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
        <div className="p-8 rounded-[40px] bg-indigo-50 border-2 border-indigo-100 shadow-inner">
          <h3 className="text-xl font-black text-indigo-900 mb-3 uppercase tracking-widest">The Catalyst</h3>
          <p className="text-sm font-medium text-indigo-800/70">Our journey started with a single line of code and a vision to make recruitment as precise as high-frequency trading.</p>
        </div>
        <div className="p-8 rounded-[40px] bg-emerald-50 border-2 border-emerald-100 shadow-inner">
          <h3 className="text-xl font-black text-emerald-900 mb-3 uppercase tracking-widest">The Evolution</h3>
          <p className="text-sm font-medium text-emerald-800/70">From a startup to a global network, we've evolved into an ecosystem that nurtures careers through every stage of growth.</p>
        </div>
      </div>
      <p className="font-bold text-[#113253]">
        Today, Hire-X stands as the premier destination for professionals who refuse to settle. We are more than a platform; we are your strategic advantage in the global talent economy.
      </p>
    </div>
  </PageWrapper>
);

export const MeetTheTeam = () => {
  const [adminEmail, setAdminEmail] = useState('admin@hire-x.com');

  useEffect(() => {
    fetch('/api/contact')
      .then(res => res.json())
      .then(data => {
        if (data && data.email) setAdminEmail(data.email);
      })
      .catch(() => {});
  }, []);

  return (
    <PageWrapper title="The Team" bgColor="bg-gradient-to-br from-[#e2f0ef] via-[#c4e8e6] to-[#e2f0ef]">
      <p className="text-center mb-16 text-xl font-medium text-gray-500 italic">Meet the architects of the Hire-X Ecosystem.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="flex flex-col items-center text-center group">
          <div className="w-48 h-48 rounded-[60px] bg-gradient-to-tr from-cyan-400 to-blue-600 mb-6 shadow-2xl group-hover:rotate-6 transition-all duration-500 overflow-hidden relative border-4 border-white">
             <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
          </div>
          <h3 className="text-3xl font-black text-[#113253]">Darshan K M</h3>
          <p className="text-[#489895] font-black uppercase tracking-widest text-sm mt-1">Founder & Chief Architect</p>
          <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 w-full">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Direct Contact</p>
            <p className="text-lg font-black text-[#113253]">{adminEmail}</p>
          </div>
        </div>
        <div className="flex flex-col items-center text-center group">
          <div className="w-48 h-48 rounded-[60px] bg-gradient-to-tr from-purple-400 to-pink-600 mb-6 shadow-2xl group-hover:-rotate-6 transition-all duration-500 overflow-hidden relative border-4 border-white">
             <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
          </div>
          <h3 className="text-3xl font-black text-[#113253]">Global Support</h3>
          <p className="text-[#806bf8] font-black uppercase tracking-widest text-sm mt-1">Execution Network</p>
          <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 w-full">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Support Email</p>
            <p className="text-lg font-black text-[#113253]">support@hire-x.com</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export const Careers = () => (
  <PageWrapper title="Careers" bgColor="bg-gradient-to-br from-[#e2f0ef] via-[#c4e8e6] to-[#e2f0ef]">
    <div className="space-y-10">
      <p className="text-xl font-medium">
        We're building the future of work, and we need visionaries to help us define it. At Hire-X, you're not just an employee; you're a stakeholder in global progress.
      </p>
      <div className="grid grid-cols-1 gap-6">
        {['System Architect', 'AI Ethics Lead', 'Growth Engineer'].map(role => (
          <div key={role} className="group bg-gray-50 p-8 rounded-[40px] border-2 border-transparent transition-all cursor-default flex justify-between items-center shadow-sm">
            <div>
              <h3 className="text-2xl font-black text-[#113253]">{role}</h3>
              <p className="text-sm font-bold text-[#489895] uppercase tracking-widest mt-1">Remote | High Performance</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </PageWrapper>
);

export const Blog = () => {
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFullArticle, setSelectedFullArticle] = useState(null);

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(async (data) => {
        if (data && data.length > 0) {
          const topTwo = data.slice(0, 2);
          // Fetch full details for these two
          const detailed = await Promise.all(topTwo.map(async (a) => {
            const res = await fetch(`/api/articles/${a.id}`);
            return res.json();
          }));
          setRecentArticles(detailed);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <PageWrapper title="Insights" bgColor="bg-gradient-to-br from-[#e2f0ef] via-[#c4e8e6] to-[#e2f0ef]">
      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
           <p className="font-black text-blue-600 uppercase tracking-widest animate-pulse">Syncing Insights...</p>
        </div>
      ) : (
        <div className="space-y-16">
          {recentArticles.map(article => (
            <article key={article.id} className="group relative">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                 <div className="w-full md:w-1/3 aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl border-4 border-white">
                    <img src={article.image_url || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                       <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">{article.category}</span>
                       <span className="text-xs font-bold text-gray-400">{article.read_time}</span>
                    </div>
                    <h2 className="text-4xl font-black text-[#113253] mb-6 leading-tight">{article.title}</h2>
                    <p className="text-gray-600 mb-8 line-clamp-3 font-medium text-lg leading-relaxed">{article.description}</p>
                    <button 
                      onClick={() => setSelectedFullArticle(article)}
                      className="px-8 py-4 bg-[#113253] text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all uppercase tracking-widest text-xs"
                    >
                      Read Full Article
                    </button>
                 </div>
              </div>
            </article>
          ))}
          
          <div className="pt-12 border-t border-gray-100 text-center">
             <Link to="/articles" className="text-[#1e3a8a] font-black uppercase tracking-[0.3em] text-sm hover:text-blue-700 transition-colors">View All Articles →</Link>
          </div>
        </div>
      )}

      {/* Full Article Modal */}
      <AnimatePresence>
        {selectedFullArticle && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#1e3a8a]/40 backdrop-blur-3xl p-4" onClick={() => setSelectedFullArticle(null)}>
             <motion.div 
               initial={{ opacity: 0, y: 50, scale: 0.9 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 50, scale: 0.9 }}
               className="bg-white rounded-[50px] shadow-[0_50px_100px_rgba(0,0,0,0.5)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative"
               onClick={e => e.stopPropagation()}
             >
                <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar flex-grow">
                   <div className="flex justify-between items-start mb-8">
                      <div>
                        <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">{selectedFullArticle.category}</span>
                        <h2 className="text-4xl md:text-5xl font-black text-[#113253] leading-tight">{selectedFullArticle.title}</h2>
                      </div>
                      <button onClick={() => setSelectedFullArticle(null)} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-inner">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                   </div>
                   <div className="w-full aspect-video rounded-[40px] overflow-hidden mb-10 shadow-2xl border-4 border-white">
                      <img src={selectedFullArticle.image_url} className="w-full h-full object-cover" alt="" />
                   </div>
                   <div className="text-gray-700 text-xl leading-relaxed whitespace-pre-line font-medium border-t border-gray-100 pt-10">
                      {selectedFullArticle.content || selectedFullArticle.description}
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export const FAQ = () => (
  <PageWrapper title="FAQ" bgColor="bg-gradient-to-br from-[#e2f0ef] via-[#c4e8e6] to-[#e2f0ef]">
    <div className="space-y-12">
      {[
        { q: "How accurate is the ATS score?", a: "Our AI model is trained on thousands of global recruitment data points, offering over 95% accuracy compared to standard enterprise ATS systems." },
        { q: "Can I use Hire-IQ in my local language?", a: "Yes, Hire-IQ supports over 100+ languages including Kannada, Hindi, and more. Simply ask it to switch!" },
        { q: "What defines an 'Elite' opportunity?", a: "Elite roles are curated based on salary benchmarks, company stability, and growth trajectory, ensuring you only see the top 1% of the market." }
      ].map(item => (
        <div key={item.q} className="border-b border-gray-100 pb-8 last:border-0">
          <h3 className="text-2xl font-black text-[#113253] mb-4">{item.q}</h3>
          <p className="text-lg font-medium text-gray-500 leading-relaxed">{item.a}</p>
        </div>
      ))}
    </div>
  </PageWrapper>
);

export const Terms = () => (
  <PageWrapper title="Terms" bgColor="bg-gradient-to-br from-[#e2f0ef] via-[#c4e8e6] to-[#e2f0ef]">
    <div className="space-y-8 text-sm font-medium">
      <p className="text-lg font-black text-[#113253] border-b border-gray-100 pb-4">Standard Operational Protocol - 2026</p>
      {[
        { h: "1. Global Access", p: "Users must maintain authentic profiles to ensure network integrity across all supported regions." },
        { h: "2. Data Sovereignty", p: "Your professional data remains your property. We only process it to enhance your matching precision." },
        { h: "3. Compliance", p: "All platform interactions must adhere to international professional ethics and fair recruitment standards." }
      ].map(s => (
        <div key={s.h}>
          <h3 className="text-xl font-black text-[#113253] mb-2 uppercase tracking-widest">{s.h}</h3>
          <p className="text-gray-600 leading-relaxed">{s.p}</p>
        </div>
      ))}
    </div>
  </PageWrapper>
);

export const Privacy = () => (
  <PageWrapper title="Privacy" bgColor="bg-gradient-to-br from-[#e2f0ef] via-[#c4e8e6] to-[#e2f0ef]">
    <div className="space-y-8 text-sm font-medium">
       <div className="bg-fuchsia-50 p-8 rounded-[40px] border-2 border-fuchsia-100 shadow-inner mb-10">
          <p className="text-fuchsia-900 font-bold text-lg leading-relaxed">
            "Your privacy is not just a policy; it's our foundational architecture. We encrypt every byte of your professional identity."
          </p>
       </div>
       {[
        { h: "Zero-Trust Security", p: "We implement multi-layer encryption for all uploaded documents and personal profile data." },
        { h: "Transparent Processing", p: "You will always know exactly which AI models are processing your data and for what purpose." },
        { h: "Right to Erasure", p: "One click. Full deletion. We respect your right to be forgotten from our global index at any time." }
       ].map(s => (
        <div key={s.h}>
          <h3 className="text-xl font-black text-[#113253] mb-2 uppercase tracking-widest">{s.h}</h3>
          <p className="text-gray-600 leading-relaxed">{s.p}</p>
        </div>
      ))}
    </div>
  </PageWrapper>
);

export const ResumeService = () => (
  <PageWrapper title="Review" bgColor="bg-gradient-to-br from-[#e2f0ef] via-[#c4e8e6] to-[#e2f0ef]">
    <div className="text-center space-y-10">
       <div className="inline-flex p-6 bg-blue-100 rounded-[40px] text-blue-600 shadow-inner">
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
       </div>
       <p className="text-3xl font-black text-[#113253] leading-tight max-w-2xl mx-auto">
          Get your profile benchmarked by the world's most sophisticated ATS engine.
       </p>
       <div className="p-10 rounded-[50px] bg-gray-50 border-2 border-gray-100 shadow-inner text-left">
          <h4 className="text-xl font-black text-[#113253] mb-4 uppercase tracking-widest">Our Methodology</h4>
          <p className="text-gray-600 font-medium leading-relaxed mb-8">
            We don't just check for spelling. We analyze semantic relevancy, leadership signals, and industry-specific trajectory scores.
          </p>
          <Link 
            to="/resume-review-details"
            className="inline-flex items-center gap-4 bg-[#113253] text-white font-black py-5 px-10 rounded-[28px] shadow-2xl hover:scale-105 transition-transform uppercase tracking-widest text-xs"
          >
            Start Detailed Review
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
       </div>
    </div>
  </PageWrapper>
);

export const ResumeReviewDetails = () => (
  <PageWrapper title="Procedure" bgColor="bg-gradient-to-br from-[#e2f0ef] via-[#c4e8e6] to-[#e2f0ef]">
    <div className="space-y-10">
      <div className="bg-white/40 p-10 rounded-[50px] border border-white shadow-inner">
        <h3 className="text-3xl font-black text-[#113253] mb-8">The Action Protocol</h3>
        <p className="text-xl text-gray-700 leading-relaxed mb-10 font-medium">
          Professional reviews are integrated directly into our application pipeline. We believe evaluation should happen in context.
        </p>
        <div className="bg-[#113253] text-white p-10 rounded-[40px] shadow-3xl mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none"></div>
          <p className="font-black text-2xl mb-8 uppercase tracking-widest text-[#489895]">Execution Steps:</p>
          <ul className="space-y-6">
            {[
              "Enter the 'Explore Opportunities' command center.",
              "Select a role that matches your elite trajectory.",
              "Activate the 'Apply Now' protocol.",
              "Submit your profile and Resume in PDF format.",
              "The engine triggers an immediate semantic analysis."
            ].map((step, idx) => (
              <li key={idx} className="flex gap-6 items-start">
                <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-xl flex-shrink-0 text-[#489895]">{idx + 1}</span>
                <span className="text-lg font-bold opacity-90 leading-tight">{step}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-gray-600 leading-relaxed text-lg font-medium">
          Once triggered, you will receive an instant Profile Match Score and comprehensive insights into your technical standing.
        </p>
      </div>
      <div className="text-center">
        <Link to="/jobs" className="inline-block bg-emerald-600 text-white font-black py-7 px-16 rounded-[32px] shadow-3xl hover:bg-emerald-700 hover:scale-105 transition-all uppercase tracking-[0.4em] text-sm">
           Enter Command Center
        </Link>
      </div>
    </div>
  </PageWrapper>
);

export const InterviewPrep = () => (
  <PageWrapper title="Mastery" bgColor="bg-gradient-to-br from-[#e2f0ef] via-[#c4e8e6] to-[#e2f0ef]">
    <div className="space-y-12">
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-purple-100 rounded-[40px] flex items-center justify-center mb-6 text-purple-600 shadow-inner">
           <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 012 2v2H9a2 2 0 01-2-2v-2.586l-1.414-1.414A2 2 0 016 10V6a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
        </div>
        <p className="text-3xl font-black text-[#113253] leading-tight">Master the Psychology of Global Recruitment.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { t: "The STAR Framework", d: "Deep dive into narrative structuring for high-impact behavioral answers." },
          { t: "Technical Logic", d: "Breaking down complex system design and algorithmic challenges." }
        ].map(item => (
          <div key={item.t} className="p-8 rounded-[40px] bg-gray-50 border-2 border-gray-100 hover:border-purple-400 transition-all">
            <h3 className="text-xl font-black text-[#113253] mb-3 uppercase tracking-widest">{item.t}</h3>
            <p className="text-gray-500 font-medium leading-relaxed">{item.d}</p>
          </div>
        ))}
      </div>
    </div>
  </PageWrapper>
);

export const CareerCoaching = () => (
  <PageWrapper title="Coaching" bgColor="bg-gradient-to-br from-[#e2f0ef] via-[#c4e8e6] to-[#e2f0ef]">
    <div className="space-y-12">
      <div className="bg-[#113253] p-12 rounded-[60px] text-white shadow-3xl relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#489895]/20 rounded-full blur-3xl"></div>
        <h2 className="text-4xl font-black mb-6 leading-tight">Direct Access to Global Mentorship.</h2>
        <p className="text-emerald-50/70 text-xl font-medium leading-relaxed">
          Elite career growth is rarely linear. Our coaching network provides the strategic clarity needed to accelerate your professional trajectory.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8">
        {[
          { h: "Strategic Trajectory", d: "Defining the long-term moves that lead to executive-level impact." },
          { h: "Negotiation Mastery", d: "Securing the high-value compensation your expertise commands." }
        ].map((item, idx) => (
          <div key={idx} className="flex gap-8 items-start p-8 bg-gray-50 rounded-[40px] border-2 border-transparent hover:border-[#489895] transition-all group">
             <div className="w-16 h-16 rounded-3xl bg-white shadow-xl flex items-center justify-center font-black text-2xl text-[#113253] group-hover:bg-[#113253] group-hover:text-white transition-all flex-shrink-0">0{idx+1}</div>
             <div>
                <h3 className="text-2xl font-black text-[#113253] mb-2">{item.h}</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-lg">{item.d}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  </PageWrapper>
);
