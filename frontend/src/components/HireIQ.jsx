import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HireIQ = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const initialMessage = {
    id: 1,
    sender: 'bot',
    text: "ನಮಸ್ಕಾರ! ನಾನು Hire-IQ ✨. ನಿಮಗೆ ಉದ್ಯೋಗ ಹುಡುಕಾಟ, ಕೋಡಿಂಗ್, ಭಾಷಾಂತರ, ಅಥವಾ ಯಾವುದೇ ವಿಷಯದ ಬಗ್ಗೆ ಸಹಾಯ ಬೇಕಿದ್ದರೂ ಕೇಳಬಹುದು. (Hello! I am Hire-IQ ✨. You can ask me for job search help, coding, translation, or absolutely anything else!)",
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([initialMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggle = () => {
    if (!user) {
      navigate('/login', { state: { isRegister: true } });
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleQuickAction = (action) => {
    handleUserMessage(action);
  };

  const handleUserMessage = async (text) => {
    if (!text.trim()) return;
    
    const newUserMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Send chat request to backend API
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          message: text,
          // Exclude feedback markers or system intro from history for the API
          history: messages.filter(m => m.sender !== 'bot-feedback' && m.id !== 1)
        })
      });

      const data = await res.json();
      const botResponse = res.ok ? data.text : "ಕ್ಷಮಿಸಿ, ಸರ್ವರ್ ದೋಷ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ. (Sorry, server error. Please try again.)";

      setMessages(prev => [...prev, 
        { id: Date.now() + 1, sender: 'bot', text: botResponse },
        { id: Date.now() + 2, sender: 'bot-feedback', text: "ಈ ಮಾಹಿತಿ ನಿಮಗೆ ಸಹಾಯವಾಯಿತೇ? (Did you find this information helpful?)" }
      ]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "ನೆಟ್‌ವರ್ಕ್ ದೋಷ! (Network Error!)" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = (isHelpful) => {
    setMessages(prev => prev.filter(msg => msg.sender !== 'bot-feedback'));
    const reply = isHelpful 
      ? "ನಿಮಗೆ ಸಹಾಯವಾಗಿದ್ದಕ್ಕೆ ನಮಗೆ ಸಂತೋಷ! ಮತ್ತೇನಾದರೂ ಬೇಕಿದ್ದರೆ ದಯವಿಟ್ಟು ಕೇಳಿ. (Glad it helped! Ask if you need anything else.)" 
      : "ಕ್ಷಮಿಸಿ, ನಾನು ಇನ್ನಷ್ಟು ಕಲಿಯುತ್ತಿದ್ದೇನೆ! ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ವಿವರಿಸಿ. (Sorry, I'm still learning! Please explain your question.)";
    
    setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: reply }]);
  };

  return (
    <div className="relative">
      {/* Navbar Icon */}
      <button 
        onClick={handleToggle}
        className="flex items-center gap-2 bg-gradient-to-r from-[#113253] to-[#489895] text-white px-4 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition-all relative group"
      >
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#806bf8] rounded-full animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#806bf8] rounded-full"></span>
        <span>✨ Hire-IQ</span>
      </button>

      {/* Sliding Drawer overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            className="fixed top-[80px] right-0 sm:right-4 w-full sm:w-[400px] h-[calc(100vh-100px)] sm:h-[600px] bg-white/70 backdrop-blur-2xl border-2 border-transparent bg-clip-padding rounded-none sm:rounded-[32px] shadow-[0_30px_60px_rgba(17,50,83,0.15)] z-50 overflow-hidden flex flex-col"
            style={{ borderImage: 'linear-gradient(to bottom right, #113253, #489895) 1' }}
          >
            {/* Inner manual border simulation for rounded corners since borderImage doesn't support radius well */}
            <div className="absolute inset-0 rounded-[30px] border-2 border-transparent/10 bg-gradient-to-br from-[#113253]/20 to-[#489895]/20 pointer-events-none" style={{ maskImage: 'linear-gradient(white, white)', WebkitMaskImage: 'linear-gradient(white, white)' }}></div>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#113253] to-[#489895] p-5 flex justify-between items-center relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner text-xl">✨</div>
                <div>
                  <h3 className="text-white font-black text-lg leading-tight">Hire-IQ Career Coach</h3>
                  <p className="text-[#e2f0ef] text-xs font-bold font-mono">By Hire-X</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-3 bg-white/40 border-b border-gray-100/50 flex gap-2 overflow-x-auto relative z-10 custom-scrollbar">
               {['Find Jobs', 'Translate to Spanish', 'Write a React Component', 'Interview Prep'].map(action => (
                 <button 
                   key={action}
                   onClick={() => handleQuickAction(action)}
                   className="whitespace-nowrap bg-white text-[#113253] border border-gray-200 hover:border-[#489895] px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5"
                 >
                   {action}
                 </button>
               ))}
            </div>

            {/* Chat Area */}
            <div className="flex-grow p-5 overflow-y-auto flex flex-col gap-4 relative z-10 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                  
                  {msg.sender === 'bot-feedback' ? (
                     <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-sm shadow-sm">
                       <p className="text-xs font-bold text-gray-600 mb-2">{msg.text}</p>
                       <div className="flex gap-2">
                         <button onClick={() => handleFeedback(true)} className="flex-1 bg-[#e2f0ef] hover:bg-[#489895] text-[#489895] hover:text-white transition-colors py-1.5 rounded-md text-xs font-bold">Yes 👍</button>
                         <button onClick={() => handleFeedback(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors py-1.5 rounded-md text-xs font-bold">No 👎</button>
                       </div>
                     </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3.5 rounded-2xl shadow-sm text-sm font-medium leading-relaxed
                        ${msg.sender === 'user' 
                          ? 'bg-[#113253] text-white rounded-tr-sm' 
                          : 'bg-white border text-gray-700 border-gray-100 rounded-tl-sm'}`}
                    >
                      {msg.text}
                    </motion.div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="self-start bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center">
                  <span className="w-2 h-2 bg-[#489895] rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-[#489895] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-[#489895] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/60 border-t border-gray-200/50 relative z-10 w-full mb-0 sm:mb-0 pb-6 sm:pb-4">
               <form 
                 onSubmit={(e) => { e.preventDefault(); handleUserMessage(inputValue); }}
                 className="flex gap-2 items-center"
               >
                 <input 
                   type="text" 
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   placeholder="Ask me anything..." 
                   className="flex-grow bg-white border border-gray-200 rounded-full py-3 px-5 outline-none focus:border-[#489895] shadow-inner text-sm font-bold text-[#113253]"
                 />
                 <button 
                    type="submit" 
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-[#113253] text-white p-3 rounded-full hover:bg-[#0c243c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex-shrink-0"
                 >
                   <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19V6m0 0l-7 7m7-7l7 7"/></svg>
                 </button>
               </form>
               <div className="text-center mt-2">
                 <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Powered by Hire-X Intelligence</p>
               </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HireIQ;
