import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Articles = () => {
  const [selectedArticle, setSelectedArticle] = useState(null);

  const articles = [
    {
      id: 1,
      tag: 'Artificial Intelligence', 
      title: 'The Future of AI in Hiring & Recruitment', 
      date: 'Oct 24, 2026',
      readTime: '6 min read',
      author: 'Dr. Alan Turing',
      img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80',
      content: 'Artificial Intelligence has rapidly evolved from a buzzword into the central nervous system of global hiring. Our latest data indicates that 85% of tech companies now utilize ML-driven algorithms to pre-screen candidates. But what does this mean for the applicant? Candidates must now optimize their portfolios not just for human eyes, but for sophisticated NLP engines capable of understanding context, semantic intent, and code quality. \n\nThe future is clear: the resume of tomorrow is a dynamic, verified knowledge graph seamlessly integrated into the recruiter\'s IDE.'
    }, 
    {
      id: 2,
      tag: 'Career Advice', 
      title: 'Writing the Perfect Software CV', 
      date: 'Oct 15, 2026',
      readTime: '4 min read',
      author: 'Jane Doe',
      img: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80',
      content: 'Your CV is your API. If the endpoints aren\'t clear, recruiters will get a 404. Start by standardizing your experience. Ditch the objective statement; instead, lead with a strong technical summary detailing your primary stack (e.g., React, Node, PostgreSQL, Go). \n\nNext, quantify your achievements. Do not just say "Improved database performance." Say "Refactored PostgreSQL queries to reduce average latency by 300ms, improving user retention by 15%." Data is the universal language of business value.'
    }, 
    {
      id: 3,
      tag: 'Work Culture', 
      title: 'Navigating Remote Team Dynamics', 
      date: 'Sep 30, 2026',
      readTime: '8 min read',
      author: 'Marcus Aurelius',
      img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80',
      content: 'As remote work becomes the de facto standard, the challenge has transitioned from "How do we collaborate?" to "How do we connect?" Managing asynchronous communication without burnout is the modern manager\'s greatest challenge. \n\nWe recommend implementing "Deep Work Windows"—mandated 4-hour blocks where Slack and meetings are strictly prohibited. Productivity is not measured by instantaneous response times, but by the thoughtful execution of deep tasks.'
    },
    {
      id: 4,
      tag: 'Market Trends', 
      title: 'Salaries in 2026: What to Expect', 
      date: 'Sep 12, 2026',
      readTime: '5 min read',
      author: 'Evelyn Shaw',
      img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80',
      content: 'The tech market has stabilized, and the compensation models have shifted. We are seeing a massive emphasis on equity and long-term retention packages over immediate base-salary inflations. High-impact roles involving AI automation, Web3 security, and spatial computing command premiums of up to 40% above standard engineering baselines. \n\nFor applicants, the strategy is clear: specialize early, negotiate holistic packages, and build a brand that transcends any single company.'
    }
  ];

  const parentVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="w-full bg-[#fdfdfd] min-h-screen relative overflow-hidden" style={{
        backgroundImage: 'radial-gradient(at 0% 0%, hsla(240,100%,98%,1) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(189,100%,94%,1) 0px, transparent 50%)'
    }}>
      
      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[50%] bg-[#806bf8] rounded-full mix-blend-multiply filter blur-[150px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[-10%] w-[50%] h-[40%] bg-[#489895] rounded-full mix-blend-multiply filter blur-[150px] opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="text-center mb-20">
          <span className="text-[#806bf8] font-black uppercase tracking-widest text-xs mb-4 block">World Class Insights</span>
          <h1 className="text-5xl md:text-7xl font-black text-[#113253] mb-6 tracking-tight">The Frontier of Hiring.</h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">Explore deep, native insights on technology, trends, and the culture of modern work globally.</p>
        </motion.div>

        <motion.div 
          variants={parentVariants} initial="hidden" animate="visible" 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10"
        >
          {articles.map((article) => (
            <motion.div 
              variants={itemVariants} 
              key={article.id} 
              onClick={() => setSelectedArticle(article)}
              className="group relative flex flex-col h-[550px] rounded-[40px] overflow-hidden cursor-pointer shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)] transition-shadow duration-500 bg-white"
            >
              {/* Massive image top */}
              <div className="absolute inset-0 h-[65%] bg-cover bg-center group-hover:scale-110 transition-transform duration-1000 ease-out" style={{ backgroundImage: `url('${article.img}')` }} />
              
              {/* Floating Glassmorphism Layer */}
              <div className="absolute bottom-3 left-3 right-3 top-[45%]">
                <div className="h-full bg-white/70 backdrop-blur-3xl border border-white/60 shadow-2xl rounded-[32px] p-8 flex flex-col transition-colors duration-500 group-hover:bg-white/95">
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-[#489895] bg-[#e2f0ef] font-black uppercase tracking-wider text-[11px] px-4 py-2 rounded-full">{article.tag}</span>
                    <span className="text-gray-400 font-bold text-[12px] uppercase tracking-widest">{article.readTime}</span>
                  </div>
                  
                  <h4 className="font-black text-[#113253] text-2xl md:text-3xl leading-tight mb-4 group-hover:text-[#806bf8] transition-colors line-clamp-2">{article.title}</h4>
                  <p className="text-gray-500 font-medium text-[15px] line-clamp-2 leading-relaxed flex-grow">{article.content}</p>
                  
                  <div className="mt-auto flex justify-between items-center border-t border-gray-100 pt-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#806bf8] to-[#4facfe] flex items-center justify-center text-white font-black text-sm">
                         {article.author.charAt(0)}
                      </div>
                      <span className="text-[#113253] font-bold text-sm">{article.author}</span>
                    </div>
                    <div className="text-[#489895] font-extrabold text-sm uppercase tracking-widest group-hover:tracking-[0.2em] transition-all flex items-center gap-2">
                       Read
                       <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Dynamic Pop-up Modal for Beautiful Reading Experience */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 py-6"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#113253]/60 backdrop-blur-md" onClick={() => setSelectedArticle(null)}></div>
            
            {/* Modal Content */}
            <motion.div 
              initial={{ scale: 0.9, y: 50, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.95, y: 20, opacity: 0 }} 
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header Image */}
              <div className="h-64 md:h-80 w-full bg-cover bg-center relative" style={{ backgroundImage: `url('${selectedArticle.img}')` }}>
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-6 right-6 w-12 h-12 bg-white/30 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#113253] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-10 md:p-14 overflow-y-auto">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="text-[#806bf8] bg-[#f0ecfc] font-black uppercase tracking-widest text-xs px-4 py-2 rounded-full">{selectedArticle.tag}</span>
                  <span className="text-gray-400 font-bold text-sm tracking-wider">{selectedArticle.date}</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black text-[#113253] mb-8 leading-tight tracking-tight">{selectedArticle.title}</h2>
                
                <div className="flex items-center gap-4 mb-10 pb-10 border-b border-gray-100">
                   <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#806bf8] to-[#4facfe] flex items-center justify-center text-white font-black text-xl shadow-md">
                      {selectedArticle.author.charAt(0)}
                   </div>
                   <div>
                     <p className="text-[#113253] font-bold text-lg">{selectedArticle.author}</p>
                     <p className="text-gray-400 font-medium text-sm">Sr. Editor @ Hire-X Intelligence</p>
                   </div>
                </div>

                <div className="prose prose-lg text-gray-600 font-medium leading-relaxed whitespace-pre-line max-w-none">
                  {selectedArticle.content}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Articles;
