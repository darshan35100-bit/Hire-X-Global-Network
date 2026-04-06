import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let cap = '';
  for(let i=0; i<5; i++) cap += chars.charAt(Math.floor(Math.random() * chars.length));
  return cap;
};

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('aspirant');
  const { login, user } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', captcha: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaTarget, setCaptchaTarget] = useState('');

  useEffect(() => {
    setCaptchaTarget(generateCaptcha());
  }, [isLogin]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
    if (location.state?.isRegister) {
      setIsLogin(false);
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Captcha Validation
    if (formData.captcha !== captchaTarget) {
      addNotification('invalid captcha', 'error');
      setCaptchaTarget(generateCaptcha()); // Reset captcha
      setFormData({...formData, captcha: ''});
      return;
    }

    if (!isLogin && formData.password.length < 6) {
      addNotification('invalid password: Password must be at least 6 characters.', 'error');
      return;
    }
    
    setLoading(true);
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin 
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password, role };
      
    try {
      const response = await fetch(`${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      
      if (response.ok) {
        addNotification(data.message || (isLogin ? 'Login successfully!' : 'Signup successfully!'), 'success');
        login(data.user, data.token);
        navigate('/');
      } else {
        addNotification(data.error || 'Identity Verification Failed', 'error');
        setCaptchaTarget(generateCaptcha()); // Reset on error
        setFormData({...formData, captcha: ''});
      }
    } catch (err) {
      addNotification('Network error connecting to servers.', 'error');
    }
    setLoading(false);
  };

  const formVariants = {
    hidden: { opacity: 0, x: isLogin ? -20 : 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: isLogin ? 20 : -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="flex-grow flex items-center justify-center min-h-screen relative overflow-hidden" 
      style={{
        background: 'linear-gradient(135deg, #4facfe 0%, #806bf8 50%, #e2f0ef 100%)',
        position: 'relative'
      }}>
      
      {/* Cinematic Blur Background Elements to match provided style */}
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] bg-[#bbf0ec] rounded-full mix-blend-overlay filter blur-[150px] opacity-80"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-[#e0d6ff] rounded-full mix-blend-overlay filter blur-[150px] opacity-80"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-4xl p-6"
      >
        <div className="bg-white/20 backdrop-blur-md rounded-[30px] border border-white/40 shadow-[0_30px_70px_rgba(0,0,0,0.1)] flex flex-col md:flex-row overflow-hidden relative">
          
          {/* LEFT SIDE - Welcome Back Gradient */}
          <div className="w-full md:w-1/2 p-12 flex flex-col justify-center items-center text-center relative overflow-hidden bg-gradient-to-br from-[#4facfe] to-[#806bf8]">
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-white rounded-full mix-blend-overlay filter blur-[60px] opacity-30"></div>
            <div className="relative z-10">
               <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
                 {isLogin ? 'Welcome Back!' : 'Join Us Today!'}
               </h2>
               <p className="text-blue-50 text-sm font-medium leading-relaxed max-w-[250px] mx-auto drop-shadow-sm">
                 {isLogin ? 'To keep connected with us please login with your personal information' : 'Enter your personal details and start your journey with us'}
               </p>
            </div>
          </div>

          {/* RIGHT SIDE - Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12 relative flex flex-col justify-center bg-white/40 backdrop-blur-xl">
             <div className="text-center mb-8">
                <h3 className="text-3xl font-black text-[#1f2937] mb-2">{isLogin ? 'Login' : 'Sign Up'}</h3>
                <p className="text-gray-600 text-sm font-medium">{isLogin ? 'Sign in to your account' : 'Register your new account'}</p>
             </div>

             <AnimatePresence mode="wait">
               <motion.form 
                 key={isLogin ? 'login' : 'register'}
                 variants={formVariants} initial="hidden" animate="visible" exit="exit"
                 onSubmit={handleSubmit} className="flex flex-col gap-4"
               >
                 {!isLogin && (
                    <div className="flex bg-white/50 backdrop-blur border border-white/60 rounded-full p-1 mb-2 shadow-inner">
                      <button type="button" onClick={() => setRole('aspirant')}
                              className={`flex-1 py-2 px-4 rounded-full text-[11px] font-extrabold uppercase transition-all ${role === 'aspirant' ? 'bg-[#806bf8] text-white shadow-md' : 'text-gray-500'}`}>Aspirant</button>
                      <button type="button" onClick={() => setRole('employer')}
                              className={`flex-1 py-2 px-4 rounded-full text-[11px] font-extrabold uppercase transition-all ${role === 'employer' ? 'bg-[#489895] text-white shadow-md' : 'text-gray-500'}`}>Employer</button>
                    </div>
                 )}

                 {!isLogin && (
                   <div className="relative">
                     <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                     </span>
                     <input type="text" placeholder={role === 'employer' ? "Company Name" : "Full Name"} required 
                            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-white/60 backdrop-blur text-sm font-bold text-[#1f2937] rounded-full py-3.5 pl-12 pr-5 outline-none border border-white/50 shadow-inner focus:border-[#806bf8] focus:bg-white transition-all placeholder-gray-500" />
                   </div>
                 )}

                 <div className="relative">
                   <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg>
                   </span>
                   <input type="email" placeholder="Username / Email" required 
                          value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-white/60 backdrop-blur text-sm font-bold text-[#1f2937] rounded-full py-3.5 pl-12 pr-5 outline-none border border-white/50 shadow-inner focus:border-[#4facfe] focus:bg-white transition-all placeholder-gray-500" />
                 </div>

                 <div className="relative">
                   {/* Lock Icon */}
                   <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                   </span>
                   <input type={showPassword ? "text" : "password"} placeholder="Password" required minLength="6"
                          value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full bg-white/60 backdrop-blur text-sm font-bold text-[#1f2937] rounded-full py-3.5 pl-12 pr-12 outline-none border border-white/50 shadow-inner focus:border-[#489895] focus:bg-white transition-all placeholder-gray-500" />
                   {/* Eye Icon for toggling visibility */}
                   <button type="button" onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 outline-none">
                     {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                     ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                     )}
                   </button>
                 </div>

                 {/* Captcha Section */}
                 <div className="flex items-center space-x-3 mt-1">
                   <div className="bg-white/40 border border-white/60 p-2 rounded-xl flex-[0.7] flex items-center justify-center relative overflow-hidden select-none">
                     {/* Captcha Noise Pattern */}
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-multiply"></div>
                     <span className="font-mono font-black text-xl text-[#374151] tracking-[0.3em] relative z-10 filter blur-[0.5px]">
                       {captchaTarget}
                     </span>
                   </div>
                   <div className="flex-1 relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </span>
                     <input type="text" placeholder="Captcha" required 
                            value={formData.captcha} onChange={(e) => setFormData({...formData, captcha: e.target.value})}
                            className="w-full bg-white/60 backdrop-blur text-sm font-bold text-[#1f2937] rounded-xl py-3 pl-10 pr-3 outline-none border border-white/50 shadow-inner focus:border-[#806bf8] focus:bg-white transition-all placeholder-gray-500" />
                   </div>
                 </div>

                 <div className="flex justify-between items-center px-2 py-1">
                   {isLogin && (
                     <label className="flex items-center space-x-2 cursor-pointer">
                       <input type="checkbox" className="w-3.5 h-3.5 text-[#806bf8] bg-white/50 border-gray-300 rounded focus:ring-[#806bf8]" />
                       <span className="text-[11px] font-bold text-gray-600">Remember me</span>
                     </label>
                   )}
                   {isLogin && (
                     <span className="text-[11px] font-bold text-[#806bf8] hover:text-[#4facfe] cursor-pointer transition-colors block ml-auto">Forgot password?</span>
                   )}
                 </div>

                 <div className="mt-2 text-center">
                   <button type="submit" disabled={loading}
                           className="bg-gradient-to-r from-[#4facfe] to-[#806bf8] text-white font-extrabold uppercase text-[12px] tracking-widest py-3.5 px-12 rounded-full shadow-[0_10px_20px_rgba(128,107,248,0.2)] transition-all duration-300 transform hover:-translate-y-2 hover:brightness-75 hover:shadow-[0_15px_30px_rgba(128,107,248,0.4)] active:scale-95 disabled:opacity-50">
                     {loading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> : (isLogin ? 'Sign In' : 'Sign Up')}
                   </button>
                 </div>
               </motion.form>
             </AnimatePresence>

             <div className="mt-8 text-center border-t border-gray-200/50 pt-6">
                <p className="text-[12px] font-bold text-gray-500">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={() => { setIsLogin(!isLogin); setFormData({name:'',email:'',password:'',captcha:''}); setRole('aspirant'); }} 
                    className="text-[#1f2937] hover:text-[#806bf8] transition-colors uppercase tracking-widest ml-1"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
             </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;
