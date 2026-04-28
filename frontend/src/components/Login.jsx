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

const WORLD_COUNTRIES = [
  {n:"Afghanistan",c:"+93"},{n:"Albania",c:"+355"},{n:"Algeria",c:"+213"},{n:"Andorra",c:"+376"},{n:"Angola",c:"+244"},
  {n:"Argentina",c:"+54"},{n:"Armenia",c:"+374"},{n:"Australia",c:"+61"},{n:"Austria",c:"+43"},{n:"Azerbaijan",c:"+994"},
  {n:"Bahrain",c:"+973"},{n:"Bangladesh",c:"+880"},{n:"Belarus",c:"+375"},{n:"Belgium",c:"+32"},{n:"Bhutan",c:"+975"},
  {n:"Bolivia",c:"+591"},{n:"Bosnia",c:"+387"},{n:"Brazil",c:"+55"},{n:"Bulgaria",c:"+359"},{n:"Cambodia",c:"+855"},
  {n:"Canada",c:"+1"},{n:"Chile",c:"+56"},{n:"China",c:"+86"},{n:"Colombia",c:"+57"},{n:"Costa Rica",c:"+506"},
  {n:"Croatia",c:"+385"},{n:"Cuba",c:"+53"},{n:"Cyprus",c:"+357"},{n:"Czech",c:"+420"},{n:"Denmark",c:"+45"},
  {n:"Ecuador",c:"+593"},{n:"Egypt",c:"+20"},{n:"Estonia",c:"+372"},{n:"Ethiopia",c:"+251"},{n:"Fiji",c:"+679"},
  {n:"Finland",c:"+358"},{n:"France",c:"+33"},{n:"Georgia",c:"+995"},{n:"Germany",c:"+49"},{n:"Ghana",c:"+233"},
  {n:"Greece",c:"+30"},{n:"Guatemala",c:"+502"},{n:"Honduras",c:"+504"},{n:"Hong Kong",c:"+852"},{n:"Hungary",c:"+36"},
  {n:"Iceland",c:"+354"},{n:"India",c:"+91"},{n:"Indonesia",c:"+62"},{n:"Iran",c:"+98"},{n:"Iraq",c:"+964"},
  {n:"Ireland",c:"+353"},{n:"Israel",c:"+972"},{n:"Italy",c:"+39"},{n:"Jamaica",c:"+1"},{n:"Japan",c:"+81"},
  {n:"Jordan",c:"+962"},{n:"Kazakhstan",c:"+7"},{n:"Kenya",c:"+254"},{n:"Kuwait",c:"+965"},{n:"Latvia",c:"+371"},
  {n:"Lebanon",c:"+961"},{n:"Libya",c:"+218"},{n:"Lithuania",c:"+370"},{n:"Luxembourg",c:"+352"},{n:"Macau",c:"+853"},
  {n:"Malaysia",c:"+60"},{n:"Maldives",c:"+960"},{n:"Malta",c:"+356"},{n:"Mexico",c:"+52"},{n:"Moldova",c:"+373"},
  {n:"Monaco",c:"+377"},{n:"Mongolia",c:"+976"},{n:"Morocco",c:"+212"},{n:"Myanmar",c:"+95"},{n:"Nepal",c:"+977"},
  {n:"Netherlands",c:"+31"},{n:"New Zealand",c:"+64"},{n:"Nigeria",c:"+234"},{n:"Norway",c:"+47"},{n:"Oman",c:"+968"},
  {n:"Pakistan",c:"+92"},{n:"Palestine",c:"+970"},{n:"Panama",c:"+507"},{n:"Paraguay",c:"+595"},{n:"Peru",c:"+51"},
  {n:"Philippines",c:"+63"},{n:"Poland",c:"+48"},{n:"Portugal",c:"+351"},{n:"Qatar",c:"+974"},{n:"Romania",c:"+40"},
  {n:"Russia",c:"+7"},{n:"Saudi Arabia",c:"+966"},{n:"Senegal",c:"+221"},{n:"Serbia",c:"+381"},{n:"Singapore",c:"+65"},
  {n:"Slovakia",c:"+421"},{n:"Slovenia",c:"+386"},{n:"Somalia",c:"+252"},{n:"South Africa",c:"+27"},{n:"South Korea",c:"+82"},
  {n:"Spain",c:"+34"},{n:"Sri Lanka",c:"+94"},{n:"Sudan",c:"+249"},{n:"Sweden",c:"+46"},{n:"Switzerland",c:"+41"},
  {n:"Syria",c:"+963"},{n:"Taiwan",c:"+886"},{n:"Tajikistan",c:"+992"},{n:"Tanzania",c:"+255"},{n:"Thailand",c:"+66"},
  {n:"Tunisia",c:"+216"},{n:"Turkey",c:"+90"},{n:"Turkmenistan",c:"+993"},{n:"Uganda",c:"+256"},{n:"Ukraine",c:"+380"},
  {n:"United Arab Emirates",c:"+971"},{n:"United Kingdom",c:"+44"},{n:"United States",c:"+1"},{n:"Uruguay",c:"+598"},
  {n:"Uzbekistan",c:"+998"},{n:"Venezuela",c:"+58"},{n:"Vietnam",c:"+84"},{n:"Yemen",c:"+967"},{n:"Zambia",c:"+260"},
  {n:"Zimbabwe",c:"+263"}
];

const OTPInput = ({ value, onChange, onComplete, focusClass = "focus:border-[#4facfe] focus:bg-white" }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));

  useEffect(() => {
    if (!value) {
      setOtp(new Array(6).fill(""));
    } else if (value.length <= 6) {
      const newOtp = new Array(6).fill("");
      for(let i=0; i<value.length; i++) newOtp[i] = value[i];
      setOtp(newOtp);
    }
  }, [value]);

  const handleChange = (element, index) => {
    const val = element.value.replace(/\D/g, ''); 
    const char = val.slice(-1);
    
    let newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    const combined = newOtp.join("");
    onChange(combined);

    if (char && element.nextSibling) {
      element.nextSibling.focus();
    }

    if (combined.length === 6 && onComplete) {
      onComplete(combined);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
       if (!otp[index] && e.target.previousSibling) {
         e.target.previousSibling.focus();
       }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = new Array(6).fill("");
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const combined = newOtp.join('');
      onChange(combined);
      
      const lastFilledIndex = pastedData.length - 1;
      const inputs = e.target.parentNode.childNodes;
      if (inputs[lastFilledIndex]) {
         inputs[lastFilledIndex].focus();
      }

      if (combined.length === 6 && onComplete) {
         onComplete(combined);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full my-2">
      <span className="text-[11px] font-black text-gray-500 mb-2 tracking-widest uppercase">Enter OTP</span>
      <div className="flex space-x-2 w-full justify-center" onPaste={handlePaste}>
        {otp.map((data, index) => (
          <input
            className={`w-[36px] h-[42px] sm:w-[44px] sm:h-[50px] bg-white/80 backdrop-blur text-lg sm:text-xl font-black text-center rounded-xl outline-none border-[2px] border-gray-300 shadow-sm transition-all text-[#1f2937] ${focusClass}`}
            type="text"
            inputMode="numeric"
            maxLength={2}
            key={`otp-${index}`}
            value={data}
            onChange={e => handleChange(e.target, index)}
            onKeyDown={e => handleKeyDown(e, index)}
            onFocus={e => e.target.select()}
          />
        ))}
      </div>
    </div>
  );
};

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('admin');
  const { login, user } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ name: '', email: '', mobile_number: '', password: '', captcha: '' });
  const [countryCode, setCountryCode] = useState('+91');
  const [loading, setLoading] = useState(false);
  const [sendingOtpState, setSendingOtpState] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaTarget, setCaptchaTarget] = useState('');
  
  // New States
  const [robotChecked, setRobotChecked] = useState(false);
  const [loginBtnState, setLoginBtnState] = useState(0); // 0 = Remember Me, 1 = Sign In
  const [isBlinking, setIsBlinking] = useState(false);

  // Forgot Password Flow
  const [forgotStep, setForgotStep] = useState(0); 
  const [forgotData, setForgotData] = useState({ identifier: '', otp: '', newPassword: '', confirmPassword: '' });

  // Destroy Account Flow
  const [destroyStep, setDestroyStep] = useState(0);
  const [destroyData, setDestroyData] = useState({ identifier: '', otp: '' });
  const [destroyTimer, setDestroyTimer] = useState(0);

  // Country Code states
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDrop, setShowCountryDrop] = useState(false);

  // Signup & Verification states
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);
  const [forgotTimer, setForgotTimer] = useState(0);

  // Timers System
  useEffect(() => { if (emailTimer > 0) { const t = setTimeout(() => setEmailTimer(emailTimer - 1), 1000); return () => clearTimeout(t); } }, [emailTimer]);
  useEffect(() => { if (forgotTimer > 0) { const t = setTimeout(() => setForgotTimer(forgotTimer - 1), 1000); return () => clearTimeout(t); } }, [forgotTimer]);
  useEffect(() => { if (destroyTimer > 0) { const t = setTimeout(() => setDestroyTimer(destroyTimer - 1), 1000); return () => clearTimeout(t); } }, [destroyTimer]);

  useEffect(() => {
    setCaptchaTarget(generateCaptcha());
    setRobotChecked(false);
    setLoginBtnState(0);
    setEmailOtp('');
    setEmailOtpSent(false);
    setEmailVerified(false);
    setEmailTimer(0);
    setForgotStep(0);
    setDestroyStep(0);
    setForgotData({ identifier: '', otp: '', newPassword: '', confirmPassword: '' });
    setDestroyData({ identifier: '', otp: '' });
  }, [isLogin]);

  const blinkNotified = React.useRef(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
    if (location.state?.isRegister) {
      setIsLogin(false);
    }
    if (location.state?.blink && !blinkNotified.current) {
      blinkNotified.current = true;
      setIsBlinking(true);
      if (location.state?.redirectMessage) {
         addNotification(location.state.redirectMessage, "error");
      }
      setTimeout(() => setIsBlinking(false), 800);
      
      // Clear the state so it doesn't blink again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [user, navigate, location, addNotification]);

  const handleNameChange = (e) => {
    const rawVal = e.target.value;
    const formatted = rawVal.split(' ').map(word => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
    setFormData({...formData, name: formatted});
  };

  const validateActive = () => {
    const isEmailValid = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email);
    const isMobValid = /^[0-9]{10}$/.test(formData.mobile_number); 
    if (!isEmailValid || !isMobValid) {
        return false;
    }
    return true;
  };

  const handleDestroyAccount = () => {
    setDestroyStep(1);
    setForgotStep(0); // Ensure forgot step is closed
  };
  
  const handleDestroySendOTP = async (e) => {
    e.preventDefault();
    if (!destroyData.identifier || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(destroyData.identifier)) {
      addNotification("Invalid email, please enter a valid email.", "error");
      return;
    }
    setSendingOtpState(true);
    try {
      const res = await fetch('/api/auth/destroy-request-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: destroyData.identifier })
      });
      if (res.ok) {
        addNotification("OTP sent successfully to your registered email", "success");
        setDestroyStep(2);
        setDestroyTimer(60);
      } else {
        const data = await res.json();
        addNotification(data.error || "Account not found.", "error");
      }
    } catch(err) { addNotification("Network error", "error"); }
    setSendingOtpState(false);
  };

  const autoVerifyDestroyOtp = async (val) => {
    try {
        const res = await fetch('/api/auth/destroy-verify-unauth', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: destroyData.identifier, otp: val })
        });
        if (res.ok) {
            addNotification("Account successfully terminated", "success");
            setDestroyStep(0);
            setDestroyData({ identifier: '', otp: '' });
            setIsLogin(false); // Move to signup page
        } else {
            const data = await res.json();
            addNotification(data.error || "Invalid OTP", "error");
        }
    } catch(err) { addNotification("Network error", "error"); }
  };

  // ----- Forgot password generic handlers -----
  const handleForgotSendOTP = async (e) => {
    e.preventDefault();
    if (!forgotData.identifier || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(forgotData.identifier)) {
      addNotification("Invalid email, please enter a valid email.", "error");
      return;
    }
    setSendingOtpState(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: forgotData.identifier })
      });
      if (res.ok) {
        addNotification("OTP sent successfully to your email/mobile", "success");
        setForgotStep(2);
        setForgotTimer(60);
      } else {
        const data = await res.json();
        addNotification(data.error || "Account not found. Please use your registered email or mobile.", "error");
      }
    } catch(err) { addNotification("Network error", "error"); }
    setSendingOtpState(false);
  };
  
  const autoVerifyForgotOtp = async (val) => {
     try {
       const res = await fetch('/api/auth/check-forgot-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: forgotData.identifier, otp: val })
       });
       if (res.ok) {
          addNotification(`OTP verified successfully!`, 'success');
          setForgotStep(3);
       } else {
          addNotification(`Invalid OTP`, 'error');
       }
     } catch (e) {}
  };

  const sendVerifyOtp = async (type) => {
     let identifier = formData.email;
     if (!identifier || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(identifier)) return addNotification("Invalid email, please enter a valid email.", "error");
     
     setSendingOtpState(true);
     try {
       const res = await fetch('/api/auth/send-verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'email', identifier })
       });
       const data = await res.json();
       if (res.ok) {
         addNotification(`OTP sent to your email!`, 'success');
         setEmailOtpSent(true); setEmailTimer(60);
       } else {
         addNotification(data.error || `Failed to send OTP`, 'error');
         if (data.error && (data.error.includes('already registered') || data.error.includes('already exists'))) setIsLogin(true);
       }
     } catch (e) { addNotification('Network error.', 'error'); }
     setSendingOtpState(false);
  };

  const autoVerifyOtp = async (type, val) => {
     let identifier = formData.email;
     try {
       const res = await fetch('/api/auth/check-verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, otp: val })
       });
       const data = await res.json();
       if (res.ok) {
          addNotification(`EMAIL verified successfully! ✅`, 'success');
          setEmailVerified(true);
       } else {
          addNotification(`Invalid OTP`, 'error');
       }
     } catch (e) {}
  };

  const handleForgotVerifyOTPAndReset = async (e) => {
    e.preventDefault();
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      addNotification("Passwords do not match", "error"); return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: forgotData.identifier, otp: forgotData.otp, newPassword: forgotData.newPassword })
      });
      if (res.ok) {
        addNotification("Credentials successfully modified.", "success");
        setForgotStep(0);
        setForgotData({ identifier: '', otp: '', newPassword: '', confirmPassword: '' });
        // Redirect to Login is implicitly handled because forgotStep becomes 0 and isLogin is usually true here
      } else {
        const data = await res.json();
        addNotification(data.error || "Invalid OTP", "error");
      }
    } catch(err) { addNotification("Network error", "error"); }
    setLoading(false);
  };

  const handleRememberMeClick = () => {
    if (!formData.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) return addNotification("Invalid email, please enter a valid email.", "error");
    if (!formData.password) return addNotification("Please fill in the Password field first.", "error");
    if (!formData.captcha) return addNotification("Please fill in the Captcha field first.", "error");
    if (!robotChecked) return addNotification("Please accept the reCAPTCHA first.", "error");
    
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        setLoginBtnState(1);
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin && loginBtnState === 0) {
      handleRememberMeClick();
      return;
    }
    
    if (!isLogin) {
       if (!formData.name) return addNotification("Please fill in the Full Name field first to register.", "error");
       if (!formData.mobile_number) return addNotification("Please fill in the Mobile Number field first to register.", "error");
       if (!formData.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) return addNotification("Invalid email, please enter a valid email.", "error");
       if (!formData.password) return addNotification("Please fill in the Password field first to register.", "error");
       if (formData.password.length < 6) {
        addNotification('Password must be at least 6 characters.', 'error');
        return;
      }
      if (!emailVerified) {
         addNotification("Please verify your Email using OTP before signing up.", "error");
         return;
      }
    } else {
       if (!formData.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) return addNotification("Invalid email, please enter a valid email.", "error");
       if (!formData.password) return addNotification("Please fill in the Password field first to login.", "error");
    }

    if (!formData.captcha) return addNotification("Please fill in the Captcha field first.", "error");

    if (!robotChecked) {
      addNotification("Please accept the reCAPTCHA first.", "error");
      return;
    }

    if (formData.captcha !== captchaTarget) {
      addNotification('invalid captcha', 'error');
      setCaptchaTarget(generateCaptcha());
      setFormData({...formData, captcha: ''});
      setRobotChecked(false);
      if (isLogin) setLoginBtnState(0);
      return;
    }
    
    setLoading(true);
    
    const body = isLogin 
      ? { email: formData.email, password: formData.password }
      : { 
          name: formData.name, 
          email: formData.email, 
          mobile_number: `${countryCode} ${formData.mobile_number}`, 
          password: formData.password,
          emailOtp
        };
      
    try {
      const response = await fetch(`/api/auth/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      
      if (response.ok) {
        if (isLogin) {
          addNotification(data.message || 'Login successfully!', 'success');
          login(data.user, data.token);
          navigate(data.user.role === 'admin' ? '/admin' : '/');
        } else {
          addNotification(data.message || 'Signup successfully! Please login.', 'success');
          setIsLogin(true);
          setFormData({...formData, password: '', captcha: ''}); 
          setRobotChecked(false);
          setLoginBtnState(0);
          setEmailVerified(false);
          setEmailOtp('');
        }
      } else {
        if (data.error && (data.error.includes('already registered') || data.error.includes('already exists'))) {
           addNotification("This account is already registered. Please sign in to continue.", 'error');
           setIsLogin(true);
        } else if (isLogin && data.error === 'invalid id') {
           addNotification("User not found. You are not registered yet, please sign up first.", 'error');
           setIsLogin(false);
        } else {
           addNotification(data.error === 'invalid password' ? "Incorrect password. Please try again." : (data.error || 'Identity Verification Failed'), 'error');
        }
        setCaptchaTarget(generateCaptcha());
        setFormData({...formData, captcha: ''});
        setRobotChecked(false);
        if (isLogin && data.error !== 'invalid id') setLoginBtnState(0);
      }
    } catch (err) {
      addNotification('Network error connecting to servers.', 'error');
    }
    setLoading(false);
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="flex-grow flex items-center justify-center min-h-screen relative overflow-hidden" 
      style={{
        background: 'linear-gradient(135deg, #4facfe 0%, #806bf8 50%, #e2f0ef 100%)',
        position: 'relative'
      }}>
      
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] bg-[#bbf0ec] rounded-full mix-blend-overlay filter blur-[150px] opacity-80"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-[#e0d6ff] rounded-full mix-blend-overlay filter blur-[150px] opacity-80"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ 
          opacity: 1, 
          scale: isBlinking ? [1, 0.95, 1.05, 1] : 1,
          filter: isBlinking ? ["brightness(1)", "brightness(1.5)", "brightness(1)"] : "none"
        }} 
        transition={{ duration: isBlinking ? 0.6 : 0.8 }}
        className={`relative z-10 w-full max-w-4xl p-6 transition-all duration-300 ${isBlinking ? 'ring-4 ring-red-400/80 shadow-[0_0_40px_rgba(248,113,113,0.5)] rounded-[38px]' : ''}`}
      >
        <div className="bg-white/20 backdrop-blur-md rounded-[30px] border border-white/40 shadow-[0_30px_70px_rgba(0,0,0,0.1)] flex flex-col md:flex-row overflow-hidden relative">
          
          <div className="w-full md:w-1/2 p-12 flex flex-col justify-center items-center text-center relative overflow-hidden bg-gradient-to-br from-[#4facfe] to-[#806bf8]">
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-white rounded-full mix-blend-overlay filter blur-[60px] opacity-30"></div>
            <div className="relative z-10">
               <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
                 {destroyStep > 0 ? 'Account Termination' : (forgotStep > 0 ? 'Password Recovery' : (isLogin ? 'Welcome Back!' : 'Join Us Today!'))}
               </h2>
               <p className="text-blue-50 text-sm font-medium leading-relaxed max-w-[250px] mx-auto drop-shadow-sm">
                 {destroyStep > 0 ? "You are about to permanently delete your account." : (forgotStep > 0 ? "Let's get your access back." : (isLogin ? 'To keep connected with us please login with your personal information' : 'Enter your personal details and start your journey with us'))}
               </p>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-12 relative flex flex-col justify-center bg-white/40 backdrop-blur-xl">
             <div className="text-center mb-6">
                <h3 className="text-3xl font-black text-[#1f2937] mb-2">
                  {destroyStep === 1 ? 'Destroy Account' : destroyStep === 2 ? 'Verify Destruction' : (forgotStep === 1 ? 'Forgot Password' : forgotStep === 2 ? 'Verify OTP' : forgotStep === 3 ? 'Reset Password' : (isLogin ? 'Login' : 'Sign Up'))}
                </h3>
             </div>

             {destroyStep > 0 && (
                <div className="flex flex-col">
                   <AnimatePresence mode="wait">
                     {destroyStep === 1 && (
                        <motion.form key="destroy1" variants={formVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleDestroySendOTP} className="flex flex-col gap-4">
                           <input type="email" placeholder="Registered Email" required
                                  value={destroyData.identifier} onChange={(e) => setDestroyData({...destroyData, identifier: e.target.value})}
                                  className="w-full bg-white/60 backdrop-blur text-sm font-bold text-[#1f2937] rounded-full py-3.5 px-5 outline-none border-[2px] border-red-500 focus:border-red-600 shadow-inner transition-all" />
                           <button type="submit" disabled={loading || sendingOtpState} className={`bg-gradient-to-r from-red-500 to-red-700 text-white font-extrabold uppercase text-[12px] tracking-widest py-3.5 px-12 rounded-full mt-2 hover:shadow-lg transition-all border-2 border-white/30 ${sendingOtpState ? 'animate-pulse opacity-80' : ''}`}>
                             {loading || sendingOtpState ? 'Sending OTP...' : 'Send OTP'}
                           </button>
                        </motion.form>
                     )}
                     {destroyStep === 2 && (
                        <motion.div key="destroy2" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-4">
                           <p className="text-sm font-semibold text-gray-600 text-center">Enter the OTP sent to your email to permanently delete your account.</p>
                           <OTPInput 
                              value={destroyData.otp} 
                              onChange={(v) => setDestroyData({...destroyData, otp: v})}
                              onComplete={(v) => autoVerifyDestroyOtp(v)}
                              focusClass="focus:border-red-500 focus:bg-white"
                           />
                           <div className="text-center mt-2">
                              <button type="button" onClick={(e) => { setDestroyData({...destroyData, otp: ''}); handleDestroySendOTP(e); }} disabled={destroyTimer > 0} className="text-xs font-bold text-red-600 disabled:text-gray-400 hover:text-red-800">
                                 {destroyTimer > 0 ? `Resend OTP in 00:${destroyTimer < 10 ? '0':''}${destroyTimer}` : 'Resend OTP'}
                              </button>
                           </div>
                        </motion.div>
                     )}
                   </AnimatePresence>
                   <div className="mt-4 text-center">
                     <button type="button" onClick={() => {setDestroyStep(0); setDestroyData({ identifier: '', otp: '' });}} className="text-sm text-gray-500 hover:text-gray-800">Cancel</button>
                   </div>
                </div>
             )}

             {forgotStep > 0 && !destroyStep && (
                <div className="flex flex-col">
                   <AnimatePresence mode="wait">
                     {forgotStep === 1 && (
                        <motion.form key="forgot1" variants={formVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleForgotSendOTP} className="flex flex-col gap-4">
                           <input type="email" placeholder="Registered Email" required
                                  value={forgotData.identifier} onChange={(e) => setForgotData({...forgotData, identifier: e.target.value})}
                                  className="w-full bg-white/60 backdrop-blur text-sm font-bold text-[#1f2937] rounded-full py-3.5 px-5 outline-none border-[2px] border-green-500 focus:border-[#4facfe] shadow-inner transition-all" />
                           <button type="submit" disabled={loading || sendingOtpState} className={`bg-gradient-to-r from-[#4facfe] to-[#806bf8] text-white font-extrabold uppercase text-[12px] tracking-widest py-3.5 px-12 rounded-full mt-2 hover:shadow-lg transition-all border-2 border-white/30 ${sendingOtpState ? 'animate-pulse opacity-80' : ''}`}>
                             {loading || sendingOtpState ? 'Sending OTP...' : 'Send OTP'}
                           </button>
                        </motion.form>
                     )}
                     {forgotStep === 2 && (
                        <motion.div key="forgot2" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-4">
                           <p className="text-sm font-semibold text-gray-600 text-center">Enter the OTP sent to your email to verify your identity.</p>
                           <OTPInput 
                              value={forgotData.otp} 
                              onChange={(v) => setForgotData({...forgotData, otp: v})}
                              onComplete={(v) => autoVerifyForgotOtp(v)}
                              focusClass="focus:border-[#4facfe] focus:bg-white"
                           />
                           <div className="text-center mt-2">
                              <button type="button" onClick={(e) => { setForgotData({...forgotData, otp: ''}); handleForgotSendOTP(e); }} disabled={forgotTimer > 0} className="text-xs font-bold text-[#806bf8] disabled:text-gray-400 hover:text-[#4facfe]">
                                 {forgotTimer > 0 ? `Resend OTP in 00:${forgotTimer < 10 ? '0':''}${forgotTimer}` : 'Resend OTP'}
                              </button>
                           </div>
                        </motion.div>
                     )}
                     {forgotStep === 3 && (
                        <motion.form key="forgot3" variants={formVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleForgotVerifyOTPAndReset} className="flex flex-col gap-4">
                           <div className="relative">
                              <input type={(showPassword ? "text" : "password")} placeholder="Enter new password" minLength="6"
                                     value={forgotData.newPassword} onChange={(e) => setForgotData({...forgotData, newPassword: e.target.value})}
                                     className="w-full bg-white/60 backdrop-blur text-sm font-bold text-[#1f2937] rounded-full py-3.5 pl-5 pr-12 outline-none border-[2px] border-green-500 focus:border-[#4facfe] shadow-inner transition-all" />
                              <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 outline-none">
                              {showPassword ? (
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              ) : (
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                              )}
                              </button>
                           </div>
                           <div className="relative">
                              <input type={(showPassword ? "text" : "password")} placeholder="Confirm new password" minLength="6"
                                     value={forgotData.confirmPassword} onChange={(e) => setForgotData({...forgotData, confirmPassword: e.target.value})}
                                     className="w-full bg-white/60 backdrop-blur text-sm font-bold text-[#1f2937] rounded-full py-3.5 pl-5 pr-12 outline-none border-[2px] border-green-500 focus:border-[#4facfe] shadow-inner transition-all" />
                              <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 outline-none">
                              {showPassword ? (
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              ) : (
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                              )}
                              </button>
                           </div>
                           <button type="submit" disabled={loading} className="bg-gradient-to-r from-[#4facfe] to-[#806bf8] text-white font-extrabold uppercase text-[12px] tracking-widest py-3.5 px-12 rounded-full mt-2 hover:shadow-lg transition-all border-2 border-white/30">
                             {loading ? 'Changing...' : 'Rotate Password'}
                           </button>
                        </motion.form>
                     )}
                   </AnimatePresence>
                   <div className="mt-4 text-center">
                     <button type="button" onClick={() => {setForgotStep(0); setForgotData({ identifier: '', otp: '', newPassword: '', confirmPassword: '' });}} className="text-sm text-gray-500 hover:text-gray-800">Back to Login</button>
                   </div>
                </div>
             )}

             {forgotStep === 0 && (
               <AnimatePresence mode="wait">
                 <motion.form 
                   key={isLogin ? 'login' : 'register'}
                   variants={formVariants} initial="hidden" animate="visible" exit="exit"
                   onSubmit={handleSubmit} className="flex flex-col gap-4"
                 >
                   {!isLogin && (
                     <>
                       <div className="relative">
                         <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                         </span>
                         <input type="text" name="name" id="name" placeholder="Full Name" autoComplete="name"
                                value={formData.name} onChange={handleNameChange}
                                className="w-full bg-white/60 backdrop-blur text-sm font-bold text-[#1f2937] rounded-full py-3.5 pl-12 pr-5 outline-none border-[2px] border-green-500 focus:border-[#806bf8] transition-all placeholder-gray-500 shadow-sm" />
                       </div>
                       
                       <div className="flex space-x-2 relative z-30">
                         <div className="relative flex-shrink-0">
                           <input 
                               type="text" 
                               value={showCountryDrop ? countrySearch : countryCode} 
                               onChange={(e) => { setCountrySearch(e.target.value); setShowCountryDrop(true); }}
                               onFocus={() => { setShowCountryDrop(true); setCountrySearch(''); }}
                               placeholder="Code"
                               className="bg-white/60 backdrop-blur text-sm font-bold text-[#1f2937] rounded-full py-3.5 pl-4 pr-2 outline-none border-[2px] border-green-500 focus:border-[#806bf8] transition-all w-[100px] shadow-sm flex-shrink-0 cursor-text"
                           />
                           {showCountryDrop && (
                               <div className="absolute top-[52px] left-0 w-[240px] max-h-[250px] overflow-y-auto bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 flex flex-col py-2 custom-scrollbar">
                                  <div className="px-4 py-1.5 text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50 mb-1 sticky top-0 border-b border-gray-100">Worldwide Region</div>
                                  {WORLD_COUNTRIES.filter(c => c.n.toLowerCase().includes(countrySearch.toLowerCase()) || c.c.includes(countrySearch)).map(c => (
                                     <div key={c.n} className="cursor-pointer px-4 py-2.5 hover:bg-[#e2f0ef] text-sm flex justify-between items-center transition-colors border-b border-gray-50/50"
                                          onClick={() => { setCountryCode(c.c); setShowCountryDrop(false); setCountrySearch(c.c); }}>
                                        <span className="font-bold text-gray-700 truncate mr-2">{c.n}</span>
                                        <span className="text-[#489895] font-black font-mono text-xs whitespace-nowrap">{c.c}</span>
                                     </div>
                                  ))}
                                  {WORLD_COUNTRIES.filter(c => c.n.toLowerCase().includes(countrySearch.toLowerCase()) || c.c.includes(countrySearch)).length === 0 && (
                                     <div className="px-4 py-3 text-xs font-bold text-red-400">No match found</div>
                                  )}
                               </div>
                           )}
                         </div>
                         {showCountryDrop && <div className="fixed inset-0 z-40" onClick={() => setShowCountryDrop(false)}></div>}
                         <div className="relative flex-1 min-w-0">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                           </span>
                           <input 
                               type="tel" name="mobile_number" id="mobile_number" autoComplete="tel"
                               placeholder="Mobile Number"
                               required
                               value={formData.mobile_number} 
                               onChange={(e) => setFormData({...formData, mobile_number: e.target.value.replace(/\D/g, '')})}
                               className="w-full bg-white/60 backdrop-blur text-sm font-bold text-[#1f2937] rounded-full py-3.5 pl-9 pr-5 outline-none border-[2px] border-green-500 focus:border-[#806bf8] transition-all placeholder-gray-500 shadow-sm" />
                         </div>
                       </div>
                     </>
                   )}

                   <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg>
                         </span>
                         <input 
                             type="email" name="email" id="email" autoComplete="username"
                             placeholder="Email Address"
                             required
                             value={formData.email} 
                             onChange={(e) => setFormData({...formData, email: e.target.value})}
                             className={`w-full bg-white/60 backdrop-blur text-sm font-bold text-[#1f2937] rounded-full py-3.5 pl-12 ${!isLogin && !emailVerified ? 'pr-24' : 'pr-5'} outline-none border-[2px] border-green-500 focus:border-[#806bf8] transition-all placeholder-gray-500 shadow-sm`} />
                         
                         {!isLogin && formData.email.includes('@') && !emailVerified && (
                             <button type="button" onClick={() => sendVerifyOtp('email')} disabled={sendingOtpState || emailTimer > 0} 
                                     className={`absolute right-2 top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] uppercase tracking-widest font-black bg-gradient-to-r from-[#4facfe] to-[#806bf8] text-white px-2.5 py-1.5 rounded-full shadow-md cursor-pointer pointer-events-auto border border-white/40 ${sendingOtpState ? 'animate-pulse opacity-80' : 'hover:shadow-lg transition-all disabled:opacity-50 hover:scale-105 active:scale-95'}`}>
                                 {sendingOtpState ? 'Sending OTP...' : (emailTimer > 0 ? `00:${emailTimer < 10 ? '0':''}${emailTimer}` : (emailOtpSent ? 'Resend' : 'Send OTP'))}
                             </button>
                         )}
                         {!isLogin && emailVerified && (
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-green-500">✅</span>
                         )}
                       </div>

                       {!isLogin && emailOtpSent && !emailVerified && (
                          <div className="relative animate-fadeIn w-full flex justify-center mt-1">
                             <OTPInput 
                                value={emailOtp} 
                                onChange={(v) => setEmailOtp(v)}
                                onComplete={(v) => autoVerifyOtp('email', v)}
                                focusClass="focus:border-[#4facfe] focus:bg-white"
                             />
                          </div>
                       )}

                   <div className="relative">
                     <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                     </span>
                     <input type={showPassword ? "text" : "password"} name="password" id="password" placeholder="Password" minLength="6" autoComplete={isLogin ? "current-password" : "new-password"} required
                            value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full bg-white/60 backdrop-blur text-sm font-bold text-[#1f2937] rounded-full py-3.5 pl-12 pr-12 outline-none border-[2px] border-green-500 focus:border-[#489895] transition-all placeholder-gray-500 shadow-sm" />
                     <button type="button" onClick={() => setShowPassword(!showPassword)}
                             className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 outline-none">
                       {showPassword ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                       ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                       )}
                     </button>
                   </div>

                   <div className="flex flex-col md:flex-row justify-between items-center gap-3 w-full mt-1">
                      <div className="flex flex-col flex-1 w-full space-y-2">
                          <div className="bg-white/80 px-2 flex items-center justify-center border border-gray-300 rounded shadow-sm w-full h-[40px] relative overflow-hidden select-none">
                              <span className="font-mono text-[16px] font-black tracking-[0.25em] text-[#374151] relative z-10 filter blur-[0.2px] drop-shadow-sm">
                                  {captchaTarget}
                              </span>
                          </div>
                          <input type="text" placeholder="Enter given Captcha" 
                                 value={formData.captcha} onChange={(e) => setFormData({...formData, captcha: e.target.value})}
                                 className="w-full h-[40px] bg-white/80 backdrop-blur text-xs font-bold text-[#1f2937] rounded outline-none border-[2px] border-green-500 focus:border-[#4facfe] px-3 shadow-inner py-2" />
                      </div>

                      <div className="flex items-center justify-between border border-[#d3d3d3] rounded-[3px] bg-[#f9f9f9] w-full md:w-[220px] shadow-sm h-[88px] overflow-hidden">
                         <div className="flex items-center space-x-3 h-full cursor-pointer hover:bg-gray-50 flex-grow px-3" 
                              onClick={() => setRobotChecked(!robotChecked)}>
                             <div className={`w-7 h-7 border-[2px] flex items-center justify-center rounded-[2px] transition-all duration-200 ${robotChecked ? 'border-none bg-transparent' : 'border-[#c1c1c1] bg-white hover:border-[#a0a0a0]'}`}>
                                 {robotChecked && <div className="w-7 h-7 bg-[url('https://www.gstatic.com/recaptcha/api2/logo_48.png')] bg-cover bg-center" style={{filter: 'hue-rotate(80deg) brightness(1.2)'}}>
                                    <svg className="w-7 h-7 text-green-600 scale-125 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                 </div>}
                             </div>
                             <span className="text-[13px] font-normal text-[#222] font-sans pb-1" style={{fontFamily: 'Roboto, helvetica, arial, sans-serif'}}>I'm not a robot</span>
                         </div>
                         
                         <div className="flex flex-col items-center justify-center pr-2 h-full border-l border-gray-200 pl-2 bg-[#f9f9f9]">
                            <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" className="w-[30px] h-[30px] opacity-90 m-1" alt="reCAPTCHA" />
                            <span className="text-[9px] text-[#555] tracking-tighter mt-1" style={{fontFamily: 'Roboto, helvetica, arial, sans-serif'}}>reCAPTCHA</span>
                            <div className="text-[8px] text-[#555] leading-none mt-[2px] flex space-x-1" style={{fontFamily: 'Roboto, helvetica, arial, sans-serif'}}>
                               <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="hover:underline text-gray-500">Privacy</a>
                               <span>-</span>
                               <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="hover:underline text-gray-500">Terms</a>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="mt-3 text-center flex flex-col items-center w-full">
                     {isLogin ? (
                        loginBtnState === 0 ? (
                          <button type="button" onClick={handleRememberMeClick} disabled={loading}
                                  className="w-full sm:w-auto animate-pulse bg-gradient-to-r from-orange-400 to-red-500 text-white font-extrabold uppercase text-[12px] tracking-widest py-3.5 px-12 rounded-full shadow-[0_10px_20px_rgba(239,68,68,0.3)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(239,68,68,0.5)] border-[2px] border-white active:scale-95 disabled:opacity-80">
                             {loading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> : 'Remember Me'}
                          </button>
                        ) : (
                          <button type="submit" disabled={loading}
                                  className="w-full sm:w-auto bg-gradient-to-r from-[#4facfe] to-[#806bf8] text-white font-extrabold uppercase text-[12px] tracking-widest py-3.5 px-12 rounded-full shadow-[0_10px_20px_rgba(128,107,248,0.2)] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(128,107,248,0.4)] border-2 border-transparent hover:border-white active:scale-95 disabled:opacity-50">
                            {loading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> : 'Sign In'}
                          </button>
                        )
                     ) : (
                        <button type="submit" disabled={loading || !emailVerified}
                                className="w-full sm:w-auto bg-gradient-to-r from-[#4facfe] to-[#806bf8] text-white font-extrabold uppercase text-[12px] tracking-widest py-3.5 px-12 rounded-full shadow-[0_10px_20px_rgba(128,107,248,0.2)] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(128,107,248,0.4)] border-2 border-transparent hover:border-white active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_10px_20px_rgba(128,107,248,0.2)]">
                          {loading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> : 'Sign Up'}
                        </button>
                     )}
                   </div>
                 </motion.form>
               </AnimatePresence>
             )}

             {forgotStep === 0 && !destroyStep && (
                <div className="mt-6 flex flex-col items-center">
                   {isLogin && (
                     <div className="flex space-x-6 text-sm mb-4 border-b border-gray-200/50 pb-4 w-full justify-center">
                       <button type="button" onClick={() => setForgotStep(1)} className="text-[12px] font-bold text-[#806bf8] hover:text-[#4facfe] transition-colors">
                         Forgot password?
                       </button>
                       <span className="text-gray-300">|</span>
                       <button type="button" onClick={handleDestroyAccount} className="text-[12px] font-bold text-red-500 hover:text-red-700 transition-colors">
                         Destroy account
                       </button>
                     </div>
                   )}
                   <p className="text-[12px] font-bold text-gray-500">
                     {isLogin ? "Don't have an account? " : "Already have an account? "}
                     <button 
                       type="button"
                       onClick={() => { setIsLogin(!isLogin); setFormData({name:'', email:'', mobile_number:'', password:'', captcha:''}); setForgotStep(0); }} 
                       className="text-[#1f2937] hover:text-[#806bf8] transition-colors uppercase tracking-widest ml-1"
                     >
                       {isLogin ? 'Sign Up' : 'Sign In'}
                     </button>
                   </p>
                </div>
             )}
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;
