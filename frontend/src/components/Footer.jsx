import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const Footer = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const [contactInfo, setContactInfo] = useState({
    email: 'darshankm35100@gmail.com',
    mobile_number: '+91 98765 43210',
    location: 'Bengaluru, Karnataka 560001'
  });

  React.useEffect(() => {
    fetch('/api/contact').then(r=>r.json()).then(d=>setContactInfo(d)).catch(()=>{});
  }, []);

  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleProtectedNavigation = (path, label) => {
    if (!user) {
      navigate('/login', { 
        state: { 
          blink: true, 
          blinkId: Date.now(), 
          redirectMessage: `Please Login or Register to access ${label}.` 
        } 
      });
    } else {
      navigate(path);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to submit feedback.");
      navigate('/login');
      return;
    }
    if (!feedbackText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: feedbackText })
      });
      if (res.ok) {
        setShowFeedbackModal(false);
        setFeedbackText('');
        window.dispatchEvent(new Event('feedback_updated'));
        alert("Feedback submitted successfully!");
      } else {
        alert("Failed to submit feedback");
      }
    } catch (err) {
      alert("Error submitting feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestionClick = () => {
    if (user && user.role === 'main_admin') {
      alert("As the Main Administrator, you cannot submit a suggestion to yourself. Access denied.");
      return;
    }
    setShowSuggestionModal(true);
  };

  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to submit suggestions.");
      navigate('/login');
      return;
    }
    if (!suggestionText.trim()) return;
    setIsSuggesting(true);
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: suggestionText })
      });
      if (res.ok) {
        setShowSuggestionModal(false);
        setSuggestionText('');
        alert("Suggestion sent to Main Admin successfully!");
      } else {
        alert("Failed to submit suggestion");
      }
    } catch (err) {
      alert("Error submitting suggestion");
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-gradient-to-br from-[#062c2b] via-[#0a3d3b] to-[#113253] text-[#F1F5F9] py-16 relative overflow-hidden"
    >
      {/* Background Animation Elements */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#4facfe] rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#2af598] rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Uniform Grid: Ensuring all columns have equal spacing and alignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 text-left">

          {/* Column 1: Contact details */}
          <div className="flex flex-col items-start">
            <h4 className="text-xl font-bold mb-6 border-b-2 border-[#2af598] pb-2 inline-block">Contact details</h4>
            <p className="text-sm opacity-80 leading-relaxed font-light">{contactInfo.location}</p>
            <p className="text-sm opacity-80 mt-4 font-light">Email: {contactInfo.email}<br />Phone: {contactInfo.mobile_number}</p>
            
            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#2af598] hover:text-[#062c2b] transition-all duration-300 shadow-lg border border-white/10 hover:border-transparent group">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#2af598] hover:text-[#062c2b] transition-all duration-300 shadow-lg border border-white/10 hover:border-transparent group">
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#2af598] hover:text-[#062c2b] transition-all duration-300 shadow-lg border border-white/10 hover:border-transparent group">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.761.464 3.447 1.341 4.966L2 22l5.163-1.354c1.478.825 3.123 1.257 4.868 1.257 5.535 0 10.031-4.496 10.031-10.032C22.062 6.495 17.566 2 12.031 2zm5.726 14.503c-.244.685-1.42 1.31-1.954 1.385-.503.071-1.144.11-3.25-.765-2.548-1.06-4.186-3.666-4.312-3.834-.125-.168-1.026-1.368-1.026-2.607 0-1.24.64-1.85.868-2.091.229-.241.498-.302.665-.302.167 0 .334.004.484.011.161.008.375-.06.575.424.21.506.708 1.728.77 1.854.062.126.104.272.02.44-.083.168-.125.272-.25.42-.125.147-.26.326-.375.44-.125.126-.26.262-.115.513.146.251.65 1.074 1.396 1.738.966.86 1.776 1.13 2.026 1.256.25.126.396.104.542-.062.146-.168.626-.728.792-.98.167-.25.334-.209.563-.125.229.084 1.458.686 1.708.812.25.126.417.189.48.293.062.105.062.608-.182 1.293z" clipRule="evenodd" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#2af598] hover:text-[#062c2b] transition-all duration-300 shadow-lg border border-white/10 hover:border-transparent group">
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
              </a>
            </div>

            <button
              onClick={handleSuggestionClick}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1 group relative border border-white/20 hover:border-transparent font-bold uppercase tracking-widest text-xs gap-3"
            >
              Immediate Contact
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </button>
          </div>

          {/* Column 2: Services available */}
          <div className="flex flex-col items-start">
            <h4 className="text-xl font-bold mb-6 border-b-2 border-[#2af598] pb-2 inline-block">Services available</h4>
            <ul className="space-y-3 text-sm opacity-80 font-light">
              <li><button onClick={() => handleProtectedNavigation('/jobs', 'Explore Jobs')} className="hover:text-[#2af598] transition-colors text-left">Job Placement</button></li>
              <li><button onClick={() => handleProtectedNavigation('/resume-review', 'Resume Review')} className="hover:text-[#2af598] transition-colors text-left">Resume Review</button></li>
              <li><button onClick={() => handleProtectedNavigation('/interview-prep', 'Interview Prep')} className="hover:text-[#2af598] transition-colors text-left">Interview Prep</button></li>
              <li><button onClick={() => handleProtectedNavigation('/career-coaching', 'Career Coaching')} className="hover:text-[#2af598] transition-colors text-left">Career Coaching</button></li>
            </ul>
          </div>

          {/* Column 3: About us */}
          <div className="flex flex-col items-start">
            <h4 className="text-xl font-bold mb-6 border-b-2 border-[#2af598] pb-2 inline-block">About us</h4>
            <ul className="space-y-3 text-sm opacity-80 font-light">
              <li><button onClick={() => handleProtectedNavigation('/our-story', 'Our Story')} className="hover:text-[#2af598] transition-colors text-left">Our Story</button></li>
              <li><button onClick={() => handleProtectedNavigation('/team', 'Meet the Team')} className="hover:text-[#2af598] transition-colors text-left">Meet the Team</button></li>
              <li><button onClick={() => handleProtectedNavigation('/careers', 'Careers')} className="hover:text-[#2af598] transition-colors text-left">Careers at Hire-X</button></li>
              <li><button onClick={() => handleProtectedNavigation('/blog', 'Blog')} className="hover:text-[#2af598] transition-colors text-left">Blog</button></li>
            </ul>
          </div>

          {/* Column 4: Helpline Resources */}
          <div className="flex flex-col items-start">
            <h4 className="text-xl font-bold mb-6 border-b-2 border-[#2af598] pb-2 inline-block">Helpline Resources</h4>
            <ul className="space-y-3 text-sm opacity-80 font-light">
              <li><button onClick={() => handleProtectedNavigation('/hire-iq', 'Help Center')} className="hover:text-[#2af598] transition-colors text-left">Help Center</button></li>
              <li><button onClick={() => handleProtectedNavigation('/faq', 'FAQ')} className="hover:text-[#2af598] transition-colors text-left">FAQ</button></li>
              <li><button onClick={() => handleProtectedNavigation('/terms', 'Terms of Service')} className="hover:text-[#2af598] transition-colors text-left">Terms of Service</button></li>
              <li><button onClick={() => handleProtectedNavigation('/privacy', 'Privacy Policy')} className="hover:text-[#2af598] transition-colors text-left">Privacy Policy</button></li>
            </ul>
          </div>
        </div>

        {/* Fancy Highlighted Review Button */}
        <div className="mt-20 flex justify-center relative z-20">
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="group relative overflow-hidden bg-gradient-to-r from-[#2af598] to-[#00e5ff] text-[#062c2b] px-10 py-3 rounded-xl font-black shadow-[0_0_20px_rgba(42,245,152,0.4)] hover:shadow-[0_0_35px_rgba(42,245,152,0.6)] transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2 text-xs uppercase tracking-[0.15em]"
          >
            <span className="relative z-10">Leave Review</span>
            {/* Glossy overlay effect on hover */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs opacity-40 font-medium tracking-widest relative z-10 uppercase">
          <p>&copy; {new Date().getFullYear()} Hire-X Ecosystem. Engineered for Excellence.</p>
        </div>
      </div>

      {/* Full Glassmorphism Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={() => setShowFeedbackModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="bg-white/10 backdrop-blur-3xl border border-white/20 p-10 rounded-[40px] w-full max-w-lg shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#2af598]/20 to-transparent rounded-bl-full pointer-events-none"></div>

              <button onClick={() => setShowFeedbackModal(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="relative z-10">
                <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Share Your Vision</h3>
                <p className="text-emerald-50/60 text-sm mb-8 font-medium leading-relaxed">Help us calibrate the Hire-X engine by sharing your feedback.</p>

                <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-6">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Describe your journey..."
                    className="w-full h-40 bg-black/20 border border-white/10 rounded-2xl p-6 text-white placeholder-emerald-100/30 outline-none focus:border-[#2af598]/40 focus:bg-black/30 transition-all resize-none shadow-inner"
                    required
                  ></textarea>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#2af598] text-[#062c2b] font-black py-4 rounded-2xl shadow-2xl hover:bg-[#00e5ff] transition-all duration-500 transform hover:scale-[1.02] disabled:opacity-50 text-md uppercase tracking-widest"
                  >
                    {isSubmitting ? 'Syncing...' : 'Submit Feedback'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuggestionModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={() => setShowSuggestionModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="bg-white/10 backdrop-blur-3xl border border-white/20 p-8 rounded-[30px] w-full max-w-md shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowSuggestionModal(false)} className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="relative z-10 text-center">
                <h3 className="text-2xl font-black text-white mb-2">Immediate Contact</h3>
                <p className="text-emerald-50/60 text-xs mb-6 font-medium">Send a direct suggestion or complaint to the Main Admin.</p>

                <form onSubmit={handleSuggestionSubmit} className="flex flex-col gap-4">
                  <textarea
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-emerald-100/30 outline-none focus:border-[#2af598]/50 focus:bg-black/40 transition-all resize-none shadow-inner text-sm"
                    required
                  ></textarea>
                  <button
                    type="submit"
                    disabled={isSuggesting}
                    className="w-full bg-[#2af598] text-[#062c2b] font-black py-3 rounded-xl shadow-lg hover:bg-[#00e5ff] transition-all transform hover:scale-[1.02] disabled:opacity-50 text-sm uppercase tracking-widest"
                  >
                    {isSuggesting ? 'Sending...' : 'Submit'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.footer>
  );
};

export default Footer;