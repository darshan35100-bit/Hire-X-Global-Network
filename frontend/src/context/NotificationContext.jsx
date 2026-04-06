import React, { createContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      {/* Global Toast Container */}
      <div className="fixed top-28 right-6 z-[9999] space-y-3 pointer-events-none flex flex-col items-end">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div 
              key={notif.id}
              initial={{ x: 100, opacity: 0, scale: 0.9 }} 
              animate={{ x: 0, opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="pointer-events-auto bg-white/80 backdrop-blur-2xl border border-white/60 text-[#113253] pl-6 pr-8 py-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] flex items-center gap-4 relative overflow-hidden min-w-[320px]"
            >
              <div className={`w-2 h-full absolute left-0 top-0 bg-gradient-to-b ${notif.type === 'error' ? 'from-red-500 to-pink-500' : 'from-[#489895] to-[#806bf8]'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner ${notif.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-[#e8f1f2] text-[#4facfe]'}`}>
                 {notif.type === 'error' ? (
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                 ) : (
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                 )}
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">{notif.type === 'error' ? 'Security Alert' : 'System Notification'}</p>
                <div className="font-extrabold text-[14px] leading-tight">{notif.message}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
