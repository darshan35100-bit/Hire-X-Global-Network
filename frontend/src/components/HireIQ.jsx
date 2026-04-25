import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { askGemini } from '../utils/gemini';

const HireIQ = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentLang, setCurrentLang] = useState('Kannada');
  const [langSearch, setLangSearch] = useState('');
  const [showLangDrop, setShowLangDrop] = useState(false);
  const [cachedJobsText, setCachedJobsText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch('/api/jobs').then(res => res.json()).then(data => {
      if (data && data.length > 0) {
        setCachedJobsText("Available Jobs on Hire-X Platform right now:\n\n" + data.map(j => `**✨ ${j.title.toUpperCase()}**\n📍 Location: ${j.location}\n⏳ Experience: ${j.years_experience} Yrs\n👉 [Click here to apply for this role](/jobs?title=${encodeURIComponent(j.title)})`).join("\n\n---\n\n"));
      }
    }).catch(() => {});
  }, []);

  const supportedLanguages = [
    "Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Azerbaijani", "Basque", "Belarusian", "Bengali", "Bosnian", "Bulgarian", "Burmese", "Catalan", "Cebuano", "Chinese", "Corsican", "Croatian", "Czech", "Danish", "Dutch", "English", "Esperanto", "Estonian", "Filipino", "Finnish", "French", "Galician", "Georgian", "German", "Greek", "Gujarati", "Haitian Creole", "Hausa", "Hawaiian", "Hebrew", "Hindi", "Hmong", "Hungarian", "Icelandic", "Igbo", "Indonesian", "Irish", "Italian", "Japanese", "Javanese", "Kannada", "Kazakh", "Khmer", "Korean", "Kurdish", "Kyrgyz", "Lao", "Latin", "Latvian", "Lithuanian", "Luxembourgish", "Macedonian", "Malagasy", "Malay", "Malayalam", "Maltese", "Maori", "Marathi", "Mongolian", "Nepali", "Norwegian", "Nyanja", "Pashto", "Persian", "Polish", "Portuguese", "Punjabi", "Romanian", "Russian", "Samoan", "Scots Gaelic", "Serbian", "Shona", "Sindhi", "Sinhala", "Slovak", "Slovenian", "Somali", "Spanish", "Sundanese", "Swahili", "Swedish", "Tajik", "Tamil", "Telugu", "Thai", "Turkish", "Ukrainian", "Urdu", "Uzbek", "Vietnamese", "Welsh", "Xhosa", "Yiddish", "Yoruba", "Zulu"
  ].sort();

  const feedbackMap = {
    Kannada: { q: "ಈ ಮಾಹಿತಿ ನಿಮಗೆ ಸಹಾಯವಾಯಿತೇ? (Did you find this information helpful?)", yes: "ನಿಮಗೆ ಸಹಾಯವಾಗಿದ್ದಕ್ಕೆ ನಮಗೆ ಸಂತೋಷ! ಮತ್ತೇನಾದರೂ ಬೇಕಿದ್ದರೆ ದಯವಿಟ್ಟು ಕೇಳಿ.", no: "ಕ್ಷಮಿಸಿ, ನಾನು ಇನ್ನಷ್ಟು ಕಲಿಯುತ್ತಿದ್ದೇನೆ! ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ವಿವರಿಸಿ." },
    Hindi: { q: "क्या यह जानकारी आपके लिए उपयोगी थी? (Did you find this information helpful?)", yes: "ख़ुशी है कि इससे मदद मिली! अगर आपको कुछ और चाहिए तो कृपया पूछें।", no: "क्षमा करें, मैं अभी भी सीख रहा हूँ! कृपया अपना प्रश्न समझाएं।" },
    Telugu: { q: "ఈ సమాచారం మీకు సహాయపడిందా? (Did you find this information helpful?)", yes: "ఇది సహాయపడినందుకు సంతోషంగా ఉంది! మీకు ఇంకేమైనా కావాలంటే దయచేసి అడగండి.", no: "క్షమించండి, నేను ఇంకా నేర్చుకుంటున్నాను! దయచేసి మీ ప్రశ్నను వివరించండి." },
    Tamil: { q: "இந்த தகவல் உங்களுக்கு பயனுள்ளதாக இருந்ததா? (Did you find this information helpful?)", yes: "இது உதவியதில் மகிழ்ச்சி! வேறு ஏதாவது தேவைப்பட்டால் தயவுசெய்து கேளுங்கள்.", no: "மன்னிக்கவும், நான் இன்னும் கற்றுக்கொள்கிறேன்! உங்கள் கேள்வியை விளக்குங்கள்." },
    Malayalam: { q: "ഈ വിവരം നിങ്ങൾക്ക് സഹായകമായോ? (Did you find this information helpful?)", yes: "ഇത് സഹായിച്ചതിൽ സന്തോഷമുണ്ട്! നിങ്ങൾക്ക് മറ്റെന്തെങ്കിലും ആവശ്യമുണ്ടെങ്കിൽ ദയവായി ചോദിക്കുക.", no: "ക്ഷമിക്കണം, ഞാൻ ഇപ്പോഴും പഠിച്ചുകൊണ്ടിരിക്കുകയാണ്! ദയവായി നിങ്ങളുടെ ചോദ്യം വിശദീകരിക്കുക." },
    Marathi: { q: "ही माहिती तुमच्यासाठी उपयुक्त ठरली का? (Did you find this information helpful?)", yes: "यामुळे मदत झाली याचा आनंद आहे! तुम्हाला आणखी काही हवे असल्यास कृपया विचारा.", no: "क्षमस्व, मी अजूनही शिकत आहे! कृपया आपला प्रश्न स्पष्ट करा." },
    Bengali: { q: "আপনি কি এই তথ্যটি সহায়ক বলে মনে করেছেন? (Did you find this information helpful?)", yes: "এটি সাহায্য করেছে বলে আনন্দিত! আপনার অন্য কিছু প্রয়োজন হলে জিজ্ঞাসা করুন.", no: "দুঃখিত, আমি এখনও শিখছি! আপনার প্রশ্ন ব্যাখ্যা করুন." },
    Gujarati: { q: "શું તમને આ માહિતી ઉપયોગી લાગી? (Did you find this information helpful?)", yes: "આનંદ છે કે આ મદદરૂપ થયુ! જો તમને બીજું કંઈ જોઈતું હોય તો કૃપા કરીને પૂછો.", no: "માફ કરશો, હું હજી શીખી રહ્યો છું! કૃપા કરીને તમારો પ્રશ્ન સમજાવો." },
    Urdu: { q: "کیا یہ معلومات آپ کے لیے مفید تھیں؟ (Did you find this information helpful?)", yes: "خوشی ہے کہ اس سے مدد ملی! اگر آپ کو کچھ اور چاہیے تو براہ کرم پوچھیں۔", no: "معذرت، میں ابھی بھی سیکھ رہا ہوں! براہ کرم اپنا سوال سمجھائیں۔" },
    English: { q: "Did you find this information helpful?", yes: "Glad it helped! Ask if you need anything else.", no: "Sorry, I'm still learning! Please explain your question." },
    Spanish: { q: "¿Te resultó útil esta información? (Did you find this information helpful?)", yes: "¡Me alegra que haya ayudado! Pregunta si necesitas algo más.", no: "¡Lo siento, todavía estoy aprendiendo! Por favor, explica tu pregunta." },
    French: { q: "Avez-vous trouvé ces informations utiles ? (Did you find this information helpful?)", yes: "Heureux que cela ait aidé ! Demandez si vous avez besoin d'autre chose.", no: "Désolé, j'apprends encore ! Veuillez expliquer votre question." },
    German: { q: "Fanden Sie diese Informationen hilfreich? (Did you find this information helpful?)", yes: "Freut mich, dass es geholfen hat! Fragen Sie, wenn Sie noch etwas brauchen.", no: "Entschuldigung, ich lerne noch! Bitte erklären Sie Ihre Frage." },
    Chinese: { q: "您认为这些信息有帮助吗？ (Did you find this information helpful?)", yes: "很高兴能帮到你！如果还需要什么请尽管问。", no: "抱歉，我还在学习！请解释一下你的问题。" },
    Japanese: { q: "この情報は役に立ちましたか？ (Did you find this information helpful?)", yes: "お役に立てて嬉しいです！他に何か必要であれば聞いてください。", no: "ごめんなさい、まだ学習中です！質問を説明してください。" },
    Korean: { q: "이 정보가 도움이 되셨나요? (Did you find this information helpful?)", yes: "도움이 되어 기쁩니다! 더 필요한 것이 있으면 물어보세요.", 단: "죄송합니다. 저는 아직 배우는 중입니다! 질문을 설명해 주세요." },
    Arabic: { q: "هل وجدت هذه المعلومات مفيدة؟ (Did you find this information helpful?)", yes: "سعيد لأن هذا ساعدك! اسأل إذا كنت بحاجة إلى أي شيء آخر.", no: "عذراً، ما زلت أتعلم! يرجى شرح سؤالك." },
    Russian: { q: "Была ли эта информация полезной? (Did you find this information helpful?)", yes: "Рад, что это помогло! Спрашивайте, если нужно что-то еще.", no: "Извините, я все еще учусь! Пожалуйста, объясните свой вопрос." },
    Portuguese: { q: "Você achou esta informação útil? (Did you find this information helpful?)", yes: "Fico feliz que tenha ajudado! Pergunte se precisar de mais alguma coisa.", no: "Desculpe, ainda estou aprendendo! Por favor, explique sua pergunta." },
    Italian: { q: "Hai trovato utili queste informazioni? (Did you find this information helpful?)", yes: "Sono felice di esserti stato d'aiuto! Chiedi se hai bisogno di altro.", no: "Scusa, sto ancora imparando! Per favore, spiega la tua domanda." }
  };

  const initialMessage = {
    id: 1,
    sender: 'bot',
    text: "Hello! I am Hire-IQ ✨. You can ask me for job search help, coding, translation, or absolutely anything else! (ನಮಸ್ಕಾರ! ನಾನು Hire-IQ ✨. ನಿಮಗೆ ಉದ್ಯೋಗ ಹುಡುಕಾಟ, ಕೋಡಿಂಗ್, ಭಾಷಾಂತರ, ಅಥವಾ ಯಾವುದೇ ವಿಷಯದ ಬಗ್ಗೆ ಸಹಾಯ ಬೇಕಿದ್ದರೂ ಕೇಳಬಹುದು.)",
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([initialMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!user) {
      setIsOpen(false);
      setMessages([]);
      setInputValue('');
      setLangSearch('');
    }
  }, [user]);

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
      // Use pre-fetched context for instant responses
      const chatHistory = messages.filter(m => m.sender !== 'bot-feedback' && m.id !== 1);
      
      let enrichedText = text;
      if (cachedJobsText && (text.toLowerCase().includes('job') || text.toLowerCase().includes('work') || text.toLowerCase().includes('career') || text.toLowerCase().includes('hire'))) {
         enrichedText = text + `\n\n[SYSTEM BACKGROUND CONTEXT:\n${cachedJobsText}\n\nCRITICAL INSTRUCTION: You MUST list these available jobs to the user formatted strictly with the markdown links provided.]`;
      }
      
      const botResponse = await askGemini(enrichedText, chatHistory);
      const currentFeedback = feedbackMap[currentLang] || feedbackMap["English"];

      setMessages(prev => [...prev, 
        { id: Date.now() + 1, sender: 'bot', text: botResponse },
        { id: Date.now() + 2, sender: 'bot-feedback', text: currentFeedback.q }
      ]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "ಕ್ಷಮಿಸಿ, ಈ ಸಮಯದಲ್ಲಿ ಪ್ರತಿಕ್ರಿಯೆ ಸಿಗುತ್ತಿಲ್ಲ. ಬೇರೊಂದು ಪ್ರಶ್ನೆ ಕೇಳಿ? (Sorry, I'm unable to answer right now. Could you ask a different question?)" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = (isHelpful) => {
    setMessages(prev => prev.filter(msg => msg.sender !== 'bot-feedback'));
    const replies = feedbackMap[currentLang] || feedbackMap["English"];
    const reply = isHelpful ? replies.yes : (replies.no || replies.단);
    
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
            className="fixed top-[80px] right-2 sm:right-4 w-[calc(100%-16px)] sm:w-[400px] h-[calc(100vh-100px)] sm:h-[600px] bg-white/70 backdrop-blur-2xl ring-2 ring-[#489895]/30 rounded-[32px] shadow-[0_30px_60px_rgba(17,50,83,0.15)] z-50 overflow-hidden flex flex-col"
          >
            {/* Inner background highlight for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#113253]/5 to-[#489895]/10 pointer-events-none -z-10"></div>
            
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

            {/* Language Menu Overlay */}
            <AnimatePresence>
              {showLangDrop && (
                 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className="absolute top-[130px] left-4 right-4 max-h-[300px] overflow-y-auto bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 flex flex-col py-2 custom-scrollbar"
                 >
                    <div className="px-4 py-2 sticky top-0 bg-white border-b border-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Available Languages</div>
                    {supportedLanguages.filter(l => l.toLowerCase().includes(langSearch.toLowerCase())).map(l => (
                       <div key={l} className="cursor-pointer px-4 py-3 hover:bg-[#e2f0ef] text-sm font-bold text-[#113253] transition-colors flex items-center gap-2 border-b border-gray-50 last:border-0"
                            onClick={() => { 
                               setCurrentLang(l); 
                               handleUserMessage(`From now on, communicate only in ${l}.`);
                               setLangSearch(l);
                               setShowLangDrop(false); 
                            }}>
                          🌍 {l}
                       </div>
                    ))}
                    {supportedLanguages.filter(l => l.toLowerCase().includes(langSearch.toLowerCase())).length === 0 && (
                       <div className="px-4 py-3 text-sm text-red-400 font-bold">No language matched.</div>
                    )}
                 </motion.div>
              )}
            </AnimatePresence>
            {showLangDrop && <div className="absolute inset-0 z-40 bg-black/5" onClick={() => setShowLangDrop(false)}></div>}

            {/* Quick Actions */}
            <div className="px-4 py-3 bg-white/40 border-b border-gray-100/50 flex flex-shrink-0 gap-2 overflow-x-auto relative z-10 custom-scrollbar items-center">
               <div className="relative flex-shrink-0 z-20">
                  <input 
                    type="text"
                    placeholder="Search languages..."
                    value={langSearch}
                    onChange={(e) => { setLangSearch(e.target.value); setShowLangDrop(true); }}
                    onFocus={() => { setShowLangDrop(true); setLangSearch(''); }}
                    className="bg-white text-[#113253] border border-gray-200 focus:border-[#489895] px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all outline-none min-w-[170px] text-center cursor-text flex-shrink-0"
                  />
               </div>
               
               {['Find Jobs', 'Resume Tips', 'Interview Prep'].map(action => (
                 <button 
                   key={action}
                   onClick={() => handleQuickAction(action)}
                   className="whitespace-nowrap bg-white text-[#113253] border border-gray-200 hover:border-[#489895] px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5 flex-shrink-0"
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
                     <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 bg-white border border-gray-200 p-3 rounded-2xl shadow-sm">
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
                          ? 'bg-[#113253] text-white rounded-2xl' 
                          : 'bg-white border text-gray-700 border-gray-100 rounded-2xl'}`}
                    >
                      {msg.sender === 'user' ? (
                        msg.text
                      ) : (
                        <div dangerouslySetInnerHTML={{ 
                          __html: msg.text
                            .replace(/</g, "&lt;").replace(/>/g, "&gt;") // basic sanitize
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#489895] text-[15px]">$1</strong>') // colored bold
                            .replace(/\*(.*?)\*/g, '<em>$1</em>') // italic
                            .replace(/\n/g, '<br />') // line breaks
                            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="inline-block bg-[#e2f0ef] text-[#489895] px-3 py-1 rounded-md text-xs font-black shadow-sm mt-2 hover:bg-[#489895] hover:text-white transition-all uppercase tracking-widest">$1</a>') // styled links
                            .replace(/---/g, '<hr class="my-4 border-[#489895]/20" />') // decorative line
                        }} />
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="self-start bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex gap-1 items-center">
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
