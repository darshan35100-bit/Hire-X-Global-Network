import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './components/Home';
import AdminJobPosting from './components/AdminJobPosting';
import Footer from './components/Footer';
import Login from './components/Login';
import Jobs from './components/Jobs';
import Articles from './components/Articles';
import { AuthContext } from './context/AuthContext';
import Profile from './components/Profile';
import { NotificationContext } from './context/NotificationContext';
import HireIQ from './components/HireIQ';
import logoImg from './assets/Logo.jpeg';

function GlobalNotificationListener() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const notif = useContext(NotificationContext) || {};
  const { addNotification } = notif;

  useEffect(() => {
    const source = new EventSource('/api/notifications/stream');
    source.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      if (parsedData.type === 'SHORTLISTED') {
        if (!parsedData.user_id || (user && parsedData.user_id === user.id)) {
          addNotification(parsedData.message, 'success');
        }
      }
      if (parsedData.type === 'SUCCESS') {
        if (user && parsedData.user_id === user.id) {
          addNotification(parsedData.message, 'success');
        }
      }
      if (parsedData.type === 'NEW_APPLICATION') {
        if (user && parsedData.user_id === user.id) {
          addNotification(parsedData.message, 'success');
        }
      }
    };
    return () => source.close();
  }, [user, addNotification]);

  return null;
}

function App() {
  const auth = useContext(AuthContext) || {};
  const { user, logout } = auth;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);

  // Removed handleAdminRestriction to allow page access but block submit internally

  const NeonAntSVG = ({ className }) => (
    <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="neonPurple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d400ff" />
          <stop offset="100%" stopColor="#806bf8" />
        </linearGradient>
        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur1" />
          <feGaussianBlur stdDeviation="15" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="250" cy="250" r="230" fill="#0f0518" stroke="url(#neonPurple)" strokeWidth="8" filter="url(#neonGlow)" />
      <path d="M180,250 C150,290 80,280 100,230 C120,180 180,200 180,250 Z" stroke="url(#neonPurple)" strokeWidth="12" fill="none" filter="url(#neonGlow)" />
      <circle cx="230" cy="240" r="30" stroke="url(#neonPurple)" strokeWidth="10" fill="none" filter="url(#neonGlow)" />
      <circle cx="310" cy="210" r="40" stroke="url(#neonPurple)" strokeWidth="10" fill="none" filter="url(#neonGlow)" />
      <circle cx="320" cy="195" r="8" fill="#fff" filter="url(#neonGlow)" />
      <path d="M330,180 Q350,130 380,120" stroke="url(#neonPurple)" strokeWidth="8" fill="none" filter="url(#neonGlow)" strokeLinecap="round" />
      <path d="M300,170 Q310,120 330,80" stroke="url(#neonPurple)" strokeWidth="8" fill="none" filter="url(#neonGlow)" strokeLinecap="round" />
      <path d="M160,260 Q120,320 80,360 L120,380" stroke="url(#neonPurple)" strokeWidth="8" fill="none" filter="url(#neonGlow)" strokeLinejoin="round" />
      <path d="M220,260 Q200,340 180,400 L210,380" stroke="url(#neonPurple)" strokeWidth="8" fill="none" filter="url(#neonGlow)" strokeLinejoin="round" />
      <path d="M240,250 Q280,330 320,380 L290,400" stroke="url(#neonPurple)" strokeWidth="8" fill="none" filter="url(#neonGlow)" strokeLinejoin="round" />
      <text x="250" y="450" fill="url(#neonPurple)" fontSize="60" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" filter="url(#neonGlow)" letterSpacing="5">Hire-X</text>
    </svg>
  );

  const EagleSVG = ({ className }) => (
    <svg viewBox="0 0 512 512" fill="currentColor" className={className}>
      <path d="M472.9,134.6c-49.4,30.3-95.9,43.2-132.8,47.9c12.2-22.3,25.6-43.5,41.9-63.1c-22.8,0.5-47.5,7.9-72,21.9 c14.2-28.7,35-51.4,59.3-66.2C308.2,74.9,235.1,107,208.7,143.7c-9.1-12.7-19.4-23.9-30-34.1c11.5-2,23.3-1,34.7,2.1 c-23.7-25-54.8-44.5-90.8-55.5c23.6,12.7,43.5,31.7,59.2,54.6c-18.1-13-39.7-22.1-64.4-25.5c15.2,19.2,25.2,42.8,27.1,68.9 c-34.9-20.7-76.3-32-120.4-32c0,0-1,49.5,41.1,102.5c45.9,57.7,112.5,93.4,186.2,93.4c87,0,165-43.3,212.8-111 C469,200.7,475.2,166.7,472.9,134.6z" />
    </svg>
  );

  return (
    <Router>
      <GlobalNotificationListener />
      <div className="min-h-screen bg-[#F1F5F9] font-sans flex flex-col">
        {/* Custom Header Layout */}
        <header className="bg-white shadow">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">

              {/* Logo/Name on far left */}
              <div className="flex-shrink-0 flex items-center">
                <div
                  className="cursor-pointer mr-4 group hover:scale-105 transition-transform drop-shadow-md rotating-border-box bg-[#F1F5F9] w-[60px] h-[35px] relative mt-1"
                  onClick={() => setLogoModalOpen(true)}
                  title="Click to expand logo"
                >
                  <div className="rotating-border-content absolute inset-[3px] rounded-[calc(0.5rem-3px)] overflow-hidden bg-white flex items-center justify-center">
                    <img src={logoImg} alt="Hire-X Logo" className="w-full h-full object-cover rounded-[calc(0.5rem-3px)]" />
                  </div>
                </div>
                <h1 className="text-2xl font-extrabold text-[#113253] tracking-tight">Hire-X</h1>
              </div>

              {/* Navigation Links on right */}
              <nav className="hidden lg:flex space-x-10 items-center">
                <NavLink to="/" end className={({ isActive }) => `text-[15px] font-bold transition-all duration-300 py-1 border-b-[3px] ${isActive ? 'text-[#489895] border-[#489895]' : 'text-[#113253] border-transparent hover:text-[#489895]'}`}>Home</NavLink>
                <NavLink to="/jobs" className={({ isActive }) => `text-[15px] font-bold transition-all duration-300 py-1 border-b-[3px] ${isActive ? 'text-[#489895] border-[#489895]' : 'text-[#113253] border-transparent hover:text-[#489895]'}`}>Explore Opportunities</NavLink>
                <NavLink to="/post-job" className={({ isActive }) => `text-[15px] font-bold transition-all duration-300 py-1 border-b-[3px] ${isActive ? 'text-[#489895] border-[#489895]' : 'text-[#113253] border-transparent hover:text-[#489895]'}`}>Post a Job</NavLink>

                <NavLink to="/articles" className={({ isActive }) => `text-[15px] font-bold transition-all duration-300 py-1 border-b-[3px] ${isActive ? 'text-[#489895] border-[#489895]' : 'text-[#113253] border-transparent hover:text-[#489895]'}`}>Articles</NavLink>
                <HireIQ />
                {user ? (
                  <div className="flex items-center space-x-6">
                    <NavLink to="/profile" className={({ isActive }) => `flex items-center space-x-3 group py-1 border-b-[3px] transition-all duration-300 ${isActive ? 'border-[#489895]' : 'border-transparent'}`}>
                      {({ isActive }) => (
                        <>
                          <div className={`w-10 h-10 rounded-full bg-gray-200 border-2 shadow-md overflow-hidden flex items-center justify-center group-hover:ring-2 group-hover:ring-[#806bf8] transition-all ${isActive ? 'border-[#489895] ring-2 ring-[#489895]' : 'border-white'}`}>
                            {user.avatar ? (
                              <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
                            ) : (
                              <span className="font-extrabold text-[#113253]">{user.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <span className={`font-bold transition-colors ${isActive ? 'text-[#489895]' : 'text-[#489895] group-hover:text-[#806bf8]'}`}>Hi, {user.name.split(' ')[0]}</span>
                        </>
                      )}
                    </NavLink>
                    <button onClick={logout} className="px-5 py-2.5 bg-red-500 text-white font-extrabold rounded shadow-md hover:bg-red-600 transition-all duration-300 transform hover:-translate-y-2 hover:brightness-75 hover:shadow-lg text-sm uppercase tracking-wider">
                      Logout
                    </button>
                  </div>
                ) : (
                  <NavLink to="/login" className={({ isActive }) => `px-6 py-2.5 text-white font-extrabold rounded shadow-md transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg text-sm uppercase tracking-wider ${isActive ? 'bg-[#113253] border-b-4 border-[#489895]' : 'bg-[#489895] hover:brightness-75'}`}>
                    Login / Register
                  </NavLink>
                )}
              </nav>

              {/* Mobile menu button */}
              <div className="lg:hidden flex items-center">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#113253] hover:text-[#489895] outline-none">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>

            </div>
          </div>

          {/* Mobile Menu Content */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white border-t border-gray-100">
              <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
                <NavLink to="/" end onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `block px-3 py-3 rounded-md font-bold transition-colors ${isActive ? 'text-[#489895] bg-[#e2f0ef] border-l-4 border-[#489895]' : 'text-[#113253] hover:bg-gray-50'}`}>Home</NavLink>
                <NavLink to="/jobs" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `block px-3 py-3 rounded-md font-bold transition-colors ${isActive ? 'text-[#489895] bg-[#e2f0ef] border-l-4 border-[#489895]' : 'text-[#113253] hover:bg-gray-50'}`}>Explore Opportunities</NavLink>
                <NavLink to="/post-job" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `block px-3 py-3 rounded-md font-bold transition-colors ${isActive ? 'text-[#489895] bg-[#e2f0ef] border-l-4 border-[#489895]' : 'text-[#113253] hover:bg-gray-50'}`}>Post a Job</NavLink>
                <NavLink to="/articles" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `block px-3 py-3 rounded-md font-bold transition-colors ${isActive ? 'text-[#489895] bg-[#e2f0ef] border-l-4 border-[#489895]' : 'text-[#113253] hover:bg-gray-50'}`}>Articles</NavLink>
                <div className="px-3 py-2"><HireIQ /></div>

                {user ? (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col space-y-3">
                    <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-[#e2f0ef] border-l-4 border-[#489895]' : ''}`}>
                      {({ isActive }) => (
                        <>
                          <div className={`w-10 h-10 rounded-full bg-gray-200 shadow-sm flex items-center justify-center overflow-hidden border-2 ${isActive ? 'border-[#489895]' : 'border-gray-300'}`}>
                            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" /> : <span className="font-bold">{user.name.charAt(0)}</span>}
                          </div>
                          <span className={`font-bold ${isActive ? 'text-[#489895]' : 'text-[#489895]'}`}>My Profile</span>
                        </>
                      )}
                    </NavLink>
                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="mx-3 mt-2 px-5 py-3 bg-red-500 text-white font-bold rounded-lg text-left">Logout</button>
                  </div>
                ) : (
                  <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `block mx-3 mt-4 px-5 py-3 text-white font-extrabold rounded-lg text-center uppercase transition-all duration-300 ${isActive ? 'bg-[#113253] border-b-4 border-[#489895]' : 'bg-[#489895]'}`}>Login / Register</NavLink>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Dynamic Routes */}
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post-job" element={<AdminJobPosting />} />
            <Route path="/login" element={<Login />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        <Footer />
      </div>

      {/* Fullscreen Logo Modal */}
      <AnimatePresence>
        {logoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#F1F5F9]/80 backdrop-blur-xl flex items-center justify-center p-4 lg:p-12"
          >
            {/* Sky blue background wrapper */}
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl p-4 md:p-8 bg-sky-100 rounded-[3.5rem] shadow-[0_30px_100px_-15px_rgba(14,165,233,0.3)] border border-sky-200 flex flex-col items-center justify-center"
            >
              {/* Full Box Image View with border radius */}
              <div className="relative z-10 w-full aspect-[16/9] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] rounded-[2.5rem] overflow-hidden bg-white">
                <img src={logoImg} alt="Hire-X Logo Full" className="w-full h-full object-cover" />

                {/* Marquee inside the image, near the bottom, no background */}
                <div className="absolute bottom-[8%] left-0 w-full flex items-center overflow-hidden z-20 pointer-events-none drop-shadow-lg opacity-90 mix-blend-plus-lighter">
                  <motion.div
                    className="font-bold uppercase text-xs sm:text-sm lg:text-base flex items-center w-max"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                  >
                    <div className="flex whitespace-nowrap">
                      <span className="text-white px-6 tracking-[0.2em] drop-shadow-md">HIRE-X GLOBAL NETWORK</span>
                      <span className="text-white px-6 tracking-[0.2em] drop-shadow-md">HIRE-X GLOBAL NETWORK</span>
                      <span className="text-white px-6 tracking-[0.2em] drop-shadow-md">HIRE-X GLOBAL NETWORK</span>
                    </div>
                    <div className="flex whitespace-nowrap">
                      <span className="text-white px-6 tracking-[0.2em] drop-shadow-md">HIRE-X GLOBAL NETWORK</span>
                      <span className="text-white px-6 tracking-[0.2em] drop-shadow-md">HIRE-X GLOBAL NETWORK</span>
                      <span className="text-white px-6 tracking-[0.2em] drop-shadow-md">HIRE-X GLOBAL NETWORK</span>
                    </div>
                  </motion.div>
                </div>

                {/* The close button on top right of the logo image */}
                <button
                  onClick={() => setLogoModalOpen(false)}
                  className="absolute top-4 right-4 lg:top-6 lg:right-6 w-10 h-10 lg:w-12 lg:h-12 bg-white/60 hover:bg-red-100 hover:text-red-500 rounded-full flex items-center justify-center shadow-md backdrop-blur-sm border border-white/50 transition-all z-[100] transform hover:rotate-90 duration-300 pointer-events-auto"
                >
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </Router>
  );
}

export default App;
