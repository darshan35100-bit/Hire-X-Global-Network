import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

const Profile = () => {
  const navigate = useNavigate();
  const { token, login, logout, user } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', mobile_number: '', education: '', experience: 0, about: '', skills: '', location: '', avatar: '', dob: ''
  });
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]);
  const [receivedApps, setReceivedApps] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [shortlistApp, setShortlistApp] = useState(null);
  const [interviewForm, setInterviewForm] = useState({ date: '', timeHour: '10', timeMin: '00', timeAmPm: 'AM', mode: 'Online', place: '' });
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const formatTitleCase = (str) => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  const formatUIStandardDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    try {
      if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [y, m, d] = dateStr.split('-');
        return `${d}-${m}-${y}`;
      }
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      if (dateStr.includes(':') || typeof dateStr !== 'string') {
        let hours = d.getHours();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        let mins = d.getMinutes().toString().padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${mins} ${ampm}`;
      }
      return `${day}-${month}-${year}`;
    } catch (e) {
      return dateStr;
    }
  };
  
  // Destroy Account States
  const [destroyStep, setDestroyStep] = useState(0); 
  const [destroyData, setDestroyData] = useState({ identifier: '', otp: '' });
  const [destroyTimer, setDestroyTimer] = useState(0);
  const [sendingOtpState, setSendingOtpState] = useState(false);
  const [viewAvatarModal, setViewAvatarModal] = useState(null);
  const [showPicEdit, setShowPicEdit] = useState(false);
  const [viewCvModal, setViewCvModal] = useState(null);
  const [showCameraStream, setShowCameraStream] = useState(false);
  const videoRef = React.useRef(null);

  useEffect(() => {
    if (destroyTimer > 0) {
       const t = setTimeout(() => setDestroyTimer(destroyTimer - 1), 1000);
       return () => clearTimeout(t);
    }
  }, [destroyTimer]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { blink: true, redirectMessage: 'Please Login or Register to access your Profile.' } });
      return;
    }
    fetchProfile();
    fetchApplications();
  }, [token, navigate]);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) {
        const data = await res.json();
        if(data && data.applied) setAppliedJobs(data.applied);
        if(data && data.posted) setPostedJobs(data.posted);
        if(data && data.received) setReceivedApps(data.received);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          name: data.name || '',
          mobile_number: data.mobile_number || '',
          education: data.education || '',
          experience: data.experience || 0,
          about: data.about || '',
          skills: data.skills || '',
          location: data.location || '',
          avatar: data.avatar || '',
          dob: data.dob || ''
        });
      } else {
        if (res.status === 404 || res.status === 401 || res.status === 403) {
          logout(); // Log them out so they go back to Login
          addNotification("Session expired or user deleted. Please log in again.", "error");
        }
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const handleBase64Avatar = async (base64Image) => {
    setFormData(prev => ({...prev, avatar: base64Image}));
    setProfile(prev => ({...prev, avatar: base64Image}));
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({...formData, avatar: base64Image})
      });
      if(res.ok) {
        const data = await res.json();
        setProfile(data);
        login(data, token);
        addNotification("Profile picture updated!", "success");
      }
    } catch(err) {
      addNotification("Failed to update profile picture", "error");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        handleBase64Avatar(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowPicEdit(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setShowCameraStream(true);
      setTimeout(() => {
        if(videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch(err) {
      addNotification("Camera not accessible", "error");
    }
  };

  const capturePhoto = () => {
    if(videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      handleBase64Avatar(dataUrl);
      closeCamera();
    }
  };

  const closeCamera = () => {
    if(videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setShowCameraStream(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if(res.ok) {
        const data = await res.json();
        setProfile(data);
        setIsEditing(false);
        // update global context so navbar updates
        login(data, token);
        addNotification("Profile successfully updated!", "success");
      } else {
        addNotification("Failed to update profile", "error");
      }
    } catch(err) {
      addNotification("Network error", "error");
    }
  };
  const updateStatus = async (appId, status, extraData = {}) => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status, ...extraData })
      });
      if(res.ok) {
        addNotification(`Applicant marked as ${status}`, "success");
        fetchApplications();
      } else {
        addNotification("Failed to update status", "error");
      }
    } catch(err) {
      addNotification("Network error", "error");
    }
  };

  const handleShortlistSubmit = (e) => {
    e.preventDefault();
    setSubmittingStatus(true);
    updateStatus(shortlistApp.id, 'Shortlisted', {
       interviewDate: interviewForm.date,
       interviewTime: `${interviewForm.timeHour}:${interviewForm.timeMin} ${interviewForm.timeAmPm}`,
       interviewMode: interviewForm.mode,
       interviewLocation: interviewForm.place
    }).finally(() => {
       setSubmittingStatus(false);
       setShortlistApp(null);
       setInterviewForm({ date: '', timeHour: '10', timeMin: '00', timeAmPm: 'AM', mode: 'Online', place: '' });
    });
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setPostedJobs(postedJobs.filter(j => j.id !== jobId));
        if (selectedJobId === `job_${jobId}`) setSelectedJobId(null);
        addNotification("Job deleted successfully", "success");
      } else {
        addNotification("Failed to delete job", "error");
      }
    } catch(err) {
      addNotification("Network error", "error");
    }
  };

  const handleDestroyRequestOTP = async (e) => {
    if(e) e.preventDefault();
    if (!destroyData.identifier || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(destroyData.identifier)) {
      addNotification("Invalid email, please enter a valid email.", "error");
      return;
    }
    setSendingOtpState(true);
    try {
       const res = await fetch('/api/users/destroy-request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ identifier: destroyData.identifier })
       });
       if(res.ok) {
          addNotification("OTP sent successfully to the provided email/mobile for account deletion.", "success");
          setDestroyStep(2);
          setDestroyTimer(60);
       } else {
          addNotification("Failed to send OTP.", "error");
       }
    } catch(err) { addNotification("Network error", "error"); }
    setSendingOtpState(false);
  };
 
  const handleDestroyVerify = async (e) => {
    e.preventDefault();
    try {
       const res = await fetch('/api/users/destroy-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ identifier: destroyData.identifier, otp: destroyData.otp })
       });
       if(res.ok) {
          addNotification("Your account has been completely and permanently destroyed.", "success");
          logout();
       } else {
          const data = await res.json();
          addNotification(data.error || "Invalid OTP.", "error");
       }
    } catch(err) { addNotification("Network error", "error"); }
  };

  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    if(profile) {
      const p = profile.profile_progress || 30;
      setTimeout(() => setAnimProgress(p), 100);
    }
  }, [profile]);

  if(loading) return <div className="p-20 text-center font-bold text-dark-charcoal">Loading Global Identity...</div>;
  if(!profile) return <div className="p-20 text-center font-bold text-red-500">Failed to load profile.</div>;

  if (profile.role === 'main_admin') {
    return <AdminDashboard />;
  }

  const progress = profile.profile_progress || 30;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animProgress / 100) * circumference;

  return (
    <div className="flex-grow bg-[#F1F5F9] font-montserrat text-dark-charcoal relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      
      {/* Decorative BG */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[50%] bg-[#4facfe] rounded-full filter blur-[150px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[40%] bg-[#806bf8] rounded-full filter blur-[120px] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-5xl relative z-10 flex flex-col md:flex-row gap-8">
        
        {/* Left Col - Progress & Avatar Overview */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeInOut" }}
           className="w-full md:w-1/3 flex flex-col gap-6">
          
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-2xl text-center flex flex-col items-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-white/20 to-transparent"></div>
            
            <div className="relative w-32 h-32 rounded-full mt-10 bg-white p-1 shadow-xl mb-4 transition-all duration-300 ease-in-out cursor-pointer group">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#489895] bg-gray-100 flex items-center justify-center relative shadow-inner" onClick={() => { if(profile.avatar) setViewAvatarModal(profile.avatar); }}>
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <span className="text-4xl font-black font-playfair text-dark-charcoal">{profile.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              {!showPicEdit && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowPicEdit(true); }} 
                  className="absolute bottom-1 right-1 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center cursor-pointer shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-300 z-20 hover:-translate-y-1 hover:text-[#489895] hover:border-[#489895]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                </button>
              )}
            </div>

            <AnimatePresence>
                {showPicEdit && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={(e) => { e.stopPropagation(); setShowPicEdit(false); }}>
                    <motion.div 
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 30, scale: 0.9 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="bg-[#ffe4c4] p-8 rounded-3xl shadow-2xl relative w-full max-w-[340px] flex flex-col items-center text-center border border-white/50"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="w-full flex justify-end mb-2">
                        <button onClick={() => setShowPicEdit(false)} className="text-red-500 font-bold uppercase tracking-widest text-[13px] hover:text-red-700 transition-colors">
                          Close
                        </button>
                      </div>
                      
                      <div className="w-24 h-24 rounded-full bg-white border-[3px] border-white shadow-md mb-8 overflow-hidden flex items-center justify-center bg-gray-100">
                         {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <span className="text-4xl text-gray-300">👤</span>}
                      </div>

                      <div className="flex flex-wrap gap-4 w-full justify-center">
                         <label className="flex flex-col items-center justify-center cursor-pointer w-[80px] h-[80px] bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group border border-gray-100">
                           <span className="text-2xl text-blue-500 mb-1 group-hover:scale-110 transition-transform">🖼️</span>
                           <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Media</span>
                           <input type="file" accept="image/*" className="hidden" onChange={(e) => { setShowPicEdit(false); handleImageUpload(e); }} />
                         </label>
                         <button onClick={startCamera} className="flex flex-col items-center justify-center cursor-pointer w-[80px] h-[80px] bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group border border-gray-100">
                           <span className="text-2xl text-[#4facfe] mb-1 group-hover:scale-110 transition-transform">📸</span>
                           <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Camera</span>
                         </button>
                         <button onClick={() => { setShowPicEdit(false); handleBase64Avatar(''); }} className="flex flex-col items-center justify-center cursor-pointer w-[80px] h-[80px] bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group border border-gray-100">
                           <span className="text-2xl text-red-500 mb-1 group-hover:scale-110 transition-transform">🗑️</span>
                           <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Remove</span>
                         </button>
                      </div>
                    </motion.div>
                  </div>
                )}
            </AnimatePresence>
            
            <h2 className="text-2xl font-black font-playfair text-dark-charcoal mt-2">{profile.name}</h2>
            <p className="text-sm font-bold text-dark-charcoal uppercase tracking-widest">{profile.role}</p>

            <div className="mt-8 pt-6 border-t border-gray-100 w-full">
              <p className="text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Global Profile Strength</p>
              
              {/* Circular Progress SVG */}
              <div className="flex items-center justify-center relative w-32 h-32 mx-auto mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white" />
                  <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="text-lime-500 transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center bg-white/50 backdrop-blur rounded-full w-16 h-16 shadow-inner">
                  <span className="text-xl font-black text-[#8B4513]">{progress}%</span>
                </div>
              </div>
              <p className="text-[11px] font-medium text-dark-charcoal leading-tight">Complete your profile to increase your visibility to top-tier employers.</p>
            </div>
          </div>
        </motion.div>

        {/* Right Col - Details & Edit Form */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeInOut" }}
           className="w-full md:w-2/3 bg-white/60 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-2xl relative z-10 transition-colors">
           
           <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
             <h3 className="text-3xl font-black font-playfair text-dark-charcoal">Identity Details</h3>
             {!isEditing ? (
               <button onClick={() => setIsEditing(true)} className="bg-[#e2f0ef] hover:bg-[#489895] text-dark-charcoal hover:text-white transition-colors px-6 py-2 rounded-full font-bold text-sm shadow-sm flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                 Update Profile
               </button>
             ) : (
               <button onClick={() => setIsEditing(false)} className="text-red-600 hover:translate-x-2 font-bold text-sm tracking-widest uppercase transition-transform duration-300 inline-block shadow-sm">
                 Cancel Edit
               </button>
             )}
           </div>

           {!isEditing ? (
             <div className="space-y-8">
                
                <div>
                  <p className="text-xs font-black text-dark-charcoal uppercase tracking-widest mb-2 shadow-sm inline-block px-3 py-1 bg-white/70 backdrop-blur rounded-md text-dark-charcoal border border-white/50">Professional Summary</p>
                  <p className="text-black font-medium leading-relaxed bg-white/80 backdrop-blur p-4 rounded-xl border border-white/50 shadow-sm">{profile.about || 'No summary provided yet. Add one to stand out.'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs font-black text-dark-charcoal uppercase tracking-widest mb-2 shadow-sm inline-block px-3 py-1 bg-white/70 backdrop-blur rounded-md text-dark-charcoal border border-white/50">Location</p>
                    <p className="text-black font-bold text-lg bg-white/40 p-3 rounded-lg border border-white/50">{profile.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-dark-charcoal uppercase tracking-widest mb-2 shadow-sm inline-block px-3 py-1 bg-white/70 backdrop-blur rounded-md text-dark-charcoal border border-white/50">Contact</p>
                    <div className="bg-white/40 p-3 rounded-lg border border-white/50 flex flex-col gap-1">
                      <p className="text-black font-bold text-sm">📱 {profile.mobile_number || '+0000000000'}</p>
                      <p className="text-black font-bold text-sm">📧 {profile.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-black text-dark-charcoal uppercase tracking-widest mb-2 shadow-sm inline-block px-3 py-1 bg-white/70 backdrop-blur rounded-md text-dark-charcoal border border-white/50">Date of Birth</p>
                    <p className="text-black font-bold text-lg bg-white/40 p-3 rounded-lg border border-white/50 w-full min-h-[50px]">{formatUIStandardDate(profile.dob)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-dark-charcoal uppercase tracking-widest mb-2 shadow-sm inline-block px-3 py-1 bg-white/70 backdrop-blur rounded-md text-dark-charcoal border border-white/50">Experience</p>
                    <p className="text-black font-bold text-lg bg-white/40 p-3 rounded-lg border border-white/50">{profile.experience}+ Years Tracking</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-dark-charcoal uppercase tracking-widest mb-2 shadow-sm inline-block px-3 py-1 bg-white/70 backdrop-blur rounded-md text-dark-charcoal border border-white/50">Core Skills</p>
                    {profile.skills ? (
                      <div className="flex flex-wrap gap-2 mt-1 bg-white/40 p-3 rounded-lg border border-white/50">
                        {profile.skills.split(',').map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-white border border-gray-200 text-black font-bold text-xs rounded-full shadow-sm hover:scale-105 hover:bg-gray-100 transition-all duration-300 ease-in-out cursor-pointer">{s.trim()}</span>
                        ))}
                      </div>
                    ) : <p className="text-dark-charcoal font-medium text-sm">No skills added.</p>}
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-black text-dark-charcoal uppercase tracking-widest mb-2 shadow-sm inline-block px-3 py-1 bg-white/70 backdrop-blur rounded-md text-dark-charcoal border border-white/50">Education</p>
                    <p className="text-black font-bold text-lg capitalize bg-white/40 p-3 rounded-lg border border-white/50">{profile.education || 'None'}</p>
                  </div>
                </div>
              </div>
           ) : (
             <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-1">
                   <label className="text-xs font-black text-dark-charcoal uppercase tracking-widest">Full Name</label>
                   <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: formatTitleCase(e.target.value)})} className="w-full bg-white/80 border border-gray-200 text-black font-bold rounded-xl py-3 px-4 outline-none focus:border-[#4facfe] transition-colors duration-300 shadow-inner" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-black text-dark-charcoal uppercase tracking-widest">Mobile Number</label>
                   <input type="tel" value={formData.mobile_number} onChange={e=>setFormData({...formData, mobile_number: e.target.value})} className="w-full bg-white/80 border border-gray-200 text-black font-bold rounded-xl py-3 px-4 outline-none focus:border-[#4facfe] transition-colors duration-300 shadow-inner" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-black text-dark-charcoal uppercase tracking-widest">Date of Birth</label>
                   <input type="date" max={new Date().toISOString().split('T')[0]} min="1900-01-01" value={formData.dob} onChange={e=>setFormData({...formData, dob: e.target.value})} className="w-full bg-white/80 border border-gray-200 text-black font-bold rounded-xl py-3 px-4 outline-none focus:border-[#4facfe] transition-colors duration-300 shadow-inner" />
                 </div>
                 <div className="space-y-1 md:col-span-2">
                   <label className="text-xs font-black text-dark-charcoal uppercase tracking-widest">Location (City, Country)</label>
                   <input type="text" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} className="w-full bg-white/80 border border-gray-200 text-black font-bold rounded-xl py-3 px-4 outline-none focus:border-[#4facfe] transition-colors duration-300 shadow-inner" />
                 </div>
               </div>

               <div className="space-y-1">
                 <label className="text-xs font-black text-dark-charcoal uppercase tracking-widest">About Me</label>
                 <textarea rows="3" value={formData.about} onChange={e=>setFormData({...formData, about: e.target.value})} className="w-full bg-white/80 border border-gray-200 text-dark-charcoal font-medium rounded-xl py-3 px-4 outline-none focus:border-[#4facfe] transition-colors duration-300 shadow-inner"></textarea>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-1">
                   <label className="text-xs font-black text-dark-charcoal uppercase tracking-widest">Education Level</label>
                   <select value={formData.education} onChange={e=>setFormData({...formData, education: e.target.value})} className="w-full bg-white/80 border border-gray-200 text-black font-bold rounded-xl py-3 px-4 outline-none focus:border-[#4facfe] transition-colors duration-300 shadow-inner">
                     <option value="None">None</option>
                     <option value="High School">High School</option>
                     <option value="Bachelors">Bachelors Degree</option>
                     <option value="Masters">Masters Degree</option>
                     <option value="PhD">PhD</option>
                   </select>
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-black text-dark-charcoal uppercase tracking-widest">Experience (Years)</label>
                   <input type="number" min="0" value={formData.experience} onChange={e=>setFormData({...formData, experience: e.target.value})} className="w-full bg-white/80 border border-gray-200 text-black font-bold rounded-xl py-3 px-4 outline-none focus:border-[#4facfe] transition-colors duration-300 shadow-inner" />
                 </div>
               </div>

               <div className="space-y-1">
                 <label className="text-xs font-black text-dark-charcoal uppercase tracking-widest">Skills (Comma Separated)</label>
                 <input type="text" placeholder="e.g. React, Node.js, Design" value={formData.skills} onChange={e=>setFormData({...formData, skills: e.target.value})} className="w-full bg-white/80 border border-gray-200 text-black font-bold rounded-xl py-3 px-4 outline-none focus:border-[#4facfe] transition-colors duration-300 shadow-inner" />
               </div>

               

               <div className="pt-8 pb-4 flex justify-center w-full">
                 <button type="submit" className="bg-[#113253] text-white font-extrabold px-12 py-4 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:brightness-75 flex items-center justify-center uppercase tracking-widest text-sm">
                   Commit Changes
                 </button>
               </div>
             </form>
           )}

            {/* Engagement Slots */}
             <div className="mt-12 pt-8 border-t border-gray-100">
               <h3 className="text-3xl font-black font-playfair text-dark-charcoal mb-6">Activity Hub</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                 {/* Slot 1: Applied */}
                 <div className="bg-[#e2f0ef] border-2 border-[#489895] rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-lg transition-transform transform hover:-translate-y-1">
                   <h4 className="text-xl font-bold text-dark-charcoal mb-2">Jobs Applied</h4>
                   <p className="text-5xl font-black text-dark-charcoal mb-6">{appliedJobs.length}</p>
                   <button onClick={() => { setActiveSlot(activeSlot === 'applied' ? null : 'applied'); setSelectedJobId(null); }} className="bg-[#489895] hover:bg-[#387f7c] text-white font-bold py-3 rounded-xl uppercase tracking-widest text-xs transition-colors w-full">
                     {activeSlot === 'applied' ? 'Close Section' : 'View All Applied Jobs'}
                   </button>
                 </div>

                 {/* Slot 2: Posted */}
                 <div className="bg-[#f0ecfc] border-2 border-[#806bf8] rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-lg transition-transform transform hover:-translate-y-1">
                   <h4 className="text-xl font-bold text-dark-charcoal mb-2">Jobs Posted</h4>
                   <p className="text-5xl font-black text-dark-charcoal mb-6">{postedJobs.length}</p>
                   <button onClick={() => { setActiveSlot(activeSlot === 'posted' ? null : 'posted'); setSelectedJobId(null); }} className="bg-[#806bf8] hover:bg-[#6b58de] text-white font-bold py-3 rounded-xl uppercase tracking-widest text-xs transition-colors w-full">
                     {activeSlot === 'posted' ? 'Close Section' : 'View All Posted Jobs'}
                   </button>
                 </div>

                 {/* Slot 3: Shortlisted */}
                 <div className="bg-[#f0fdf4] border-2 border-green-500 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-lg transition-transform transform hover:-translate-y-1">
                   <h4 className="text-xl font-bold text-dark-charcoal mb-2">Shortlisted Candidates</h4>
                   <p className="text-5xl font-black text-dark-charcoal mb-6">{receivedApps.filter(app => app.status === 'Shortlisted').length}</p>
                   <button onClick={() => { setActiveSlot(activeSlot === 'shortlisted' ? null : 'shortlisted'); setSelectedJobId(null); }} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl uppercase tracking-widest text-xs transition-colors w-full">
                     {activeSlot === 'shortlisted' ? 'Close Section' : 'View Core Candidates'}
                   </button>
                 </div>
               </div>

               {/* Expanded View */}
               {activeSlot === 'applied' && (
                 <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 mb-8 animate-fadeIn relative">
                   <div className="flex justify-between items-center mb-6">
                     <h4 className="text-2xl font-black text-dark-charcoal">Applied Jobs</h4>
                     <button onClick={() => setActiveSlot(null)} className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-colors shadow-sm cursor-pointer">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                     </button>
                   </div>
                   
                   {appliedJobs.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {appliedJobs
                          .filter(app => !selectedJobId || selectedJobId === `app_${app.id}`)
                          .map(app => (
                           <div key={app.id} className={`border border-gray-200 rounded-2xl p-4 transition-colors ${selectedJobId === `app_${app.id}` ? 'bg-white shadow-md border-[#489895]' : 'bg-gray-50/50 hover:border-[#489895]'}`}>
                             {selectedJobId === `app_${app.id}` && (
                                <button onClick={(e) => { e.stopPropagation(); setSelectedJobId(null); }} className="mb-4 inline-flex items-center gap-2 bg-[#e2f0ef] hover:bg-[#489895] hover:text-white text-[#113253] px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors shadow-sm w-max">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                                  Back to Applied Jobs
                                </button>
                             )}
                             <div className={`flex justify-between items-center ${!selectedJobId ? 'cursor-pointer' : ''}`} onClick={() => !selectedJobId && setSelectedJobId(`app_${app.id}`)}>
                               <div className="flex gap-4 items-center">
                                 {app.company_logo && typeof app.company_logo === 'string' && app.company_logo.startsWith('data:image') && (
                                   <img src={app.company_logo} alt="Logo" className="w-12 h-12 rounded object-contain bg-white shadow-sm border border-gray-100 p-1 flex-shrink-0" />
                                 )}
                                 <div>
                                   <div className="flex items-center gap-2 mb-1">
                                      <h5 className="font-bold text-lg text-dark-charcoal max-w-[200px] truncate">{app.role}</h5>
                                   </div>
                                   <p className="text-sm font-black text-gray-500 uppercase tracking-widest leading-tight">{app.company_name || 'the Company'}</p>
                                   <p className="text-sm font-semibold text-dark-charcoal mt-1">{app.location}</p>
                                 </div>
                               </div>
                               <div className="text-right">
                                 <p className="text-[10px] font-black tracking-widest uppercase text-gray-400">Status</p>
                                 <p className={`font-black text-sm ${app.status === 'Shortlisted' ? 'text-green-600' : app.status === 'Rejected' ? 'text-red-500' : 'text-yellow-500'}`}>{app.status || 'Pending'}</p>
                               </div>
                            </div>
                            
                            {selectedJobId === `app_${app.id}` && (
                               <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn bg-white p-5 rounded-xl shadow-inner grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Role Requirements</p>
                                    <p className="text-sm font-bold text-dark-charcoal mb-4 bg-gray-100 inline-block px-3 py-1 rounded inline-flex gap-2 items-center flex-wrap">
                                      <span className="bg-white px-2 py-0.5 rounded shadow-sm text-xs">{app.education_level || 'Any'}</span>
                                      <span className="bg-white px-2 py-0.5 rounded shadow-sm text-xs">{app.qualification || 'Any'}</span>
                                      <span className="bg-white px-2 py-0.5 rounded shadow-sm text-xs">{app.years_experience || 'Fresher'}</span>
                                    </p>
                                    
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Job Description</p>
                                    <p className="text-sm font-medium text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">{app.description}</p>
                                    
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 mt-4">Application End Date</p>
                                    <p className="text-sm font-black text-dark-charcoal mb-4 bg-yellow-50 px-3 py-2 rounded-lg inline-block border border-yellow-200">
                                      {app.end_date ? formatUIStandardDate(app.end_date) : 'No Deadline'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">ATS Score</p>
                                    <p className="text-4xl font-black text-dark-charcoal mb-4">{app.ats_score}% Match</p>
                                    
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">CV Analysis Summary</p>
                                    <p className="text-sm font-medium text-gray-700 italic border-l-4 border-[#489895] pl-3 py-1 mb-4">"{app.cv_analysis || 'No detailed analysis available.'}"</p>
                                    
                                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-100">
                                      {app.company_logo && (
                                        <div className="flex items-center gap-3">
                                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Logo:</p>
                                          <img src={app.company_logo} alt="Company Logo" className="h-[40px] max-w-[120px] object-contain bg-white rounded shadow-sm p-1 border border-gray-200" />
                                        </div>
                                      )}
                                      {app.official_notification && (
                                        <div>
                                          <a href={app.official_notification} download="notification" className="inline-block bg-[#113253] hover:bg-[#25619c] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm uppercase tracking-widest">Download Official Notification</a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                               </div>
                            )}
                          </div>
                        ))}
                      </div>
                   ) : <p className="text-dark-charcoal font-medium text-sm">No applications found.</p>}
                 </div>
               )}

               {activeSlot === 'posted' && (
                 <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 mb-8 animate-fadeIn">
                   <div className="flex justify-between items-center mb-6">
                     <h4 className="text-2xl font-black text-dark-charcoal">Posted Jobs</h4>
                     <button onClick={() => setActiveSlot(null)} className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-colors shadow-sm cursor-pointer">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                     </button>
                   </div>
                   
                   {postedJobs.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {postedJobs
                          .filter(job => !selectedJobId || selectedJobId === `job_${job.id}`)
                          .map(job => (
                           <div key={job.id} className={`border border-gray-200 rounded-2xl p-4 transition-colors ${selectedJobId === `job_${job.id}` ? 'bg-white shadow-md border-[#806bf8]' : 'bg-gray-50/50 hover:border-[#806bf8]'}`}>
                             {selectedJobId === `job_${job.id}` && (
                                <button onClick={(e) => { e.stopPropagation(); setSelectedJobId(null); }} className="mb-4 inline-flex items-center gap-2 bg-[#f0ecfc] hover:bg-[#806bf8] hover:text-white text-[#113253] px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors shadow-sm w-max">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                                  Back to Posted Jobs
                                </button>
                             )}
                             <div className={`flex justify-between items-center ${!selectedJobId ? 'cursor-pointer' : ''}`} onClick={() => !selectedJobId && setSelectedJobId(`job_${job.id}`)}>
                               <div className="flex gap-4 items-center">
                                 {job.company_logo && typeof job.company_logo === 'string' && job.company_logo.startsWith('data:image') && (
                                   <img src={job.company_logo} alt="Logo" className="w-12 h-12 rounded object-contain bg-white shadow-sm border border-gray-100 p-1 flex-shrink-0" />
                                 )}
                                 <div>
                                   <div className="flex items-center gap-2 mb-1">
                                      <h5 className="font-bold text-lg text-dark-charcoal max-w-[200px] truncate">{job.title}</h5>
                                      {receivedApps.filter(app => app.job_id === job.id).length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">{receivedApps.filter(app => app.job_id === job.id).length} New</span>}
                                   </div>
                                   <p className="text-sm font-black text-gray-500 uppercase tracking-widest leading-tight">{job.company_name || 'the Company'}</p>
                                   <p className="text-sm font-semibold text-dark-charcoal mt-1">{job.location}</p>
                                 </div>
                               </div>
                               <div className="flex gap-3 items-center">
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); deleteJob(job.id); }} 
                                   className="bg-white hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-colors border-2 border-red-200 hover:border-red-500 uppercase tracking-widest shadow-sm"
                                 >
                                   Delete
                                 </button>
                               </div>
                            </div>
                            
                            {selectedJobId === `job_${job.id}` && (
                               <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn bg-white p-5 rounded-xl shadow-inner grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Role Requirements</p>
                                    <p className="text-sm font-bold text-dark-charcoal mb-4 bg-gray-100 inline-block px-3 py-1 rounded inline-flex gap-2 items-center flex-wrap">
                                      <span className="bg-white px-2 py-0.5 rounded shadow-sm text-xs">{job.education_level}</span>
                                      <span className="bg-white px-2 py-0.5 rounded shadow-sm text-xs">{job.qualification}</span>
                                      <span className="bg-white px-2 py-0.5 rounded shadow-sm text-xs">{job.years_experience} Exp</span>
                                    </p>
                                    
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Job Description</p>
                                    <p className="text-sm font-medium text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">{job.description}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Application End Date</p>
                                    <p className="text-sm font-black text-dark-charcoal mb-4 bg-yellow-50 px-3 py-2 rounded-lg inline-block border border-yellow-200">
                                      {job.end_date ? formatUIStandardDate(job.end_date) : 'No Deadline'}
                                     </p>
                                    <div className="flex flex-col gap-3 mt-2">
                                      {job.company_logo && (
                                        <div className="flex items-center gap-3">
                                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Logo:</p>
                                          <img src={job.company_logo} alt="Company Logo" className="h-[40px] max-w-[120px] object-contain bg-white rounded shadow-sm p-1 border border-gray-200" />
                                        </div>
                                      )}
                                      {job.official_notification && (
                                        <div>
                                          <a href={job.official_notification} download="notification" className="inline-block bg-[#113253] hover:bg-[#25619c] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm uppercase tracking-widest">Download Official Notification</a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Received Applicants mapped here */}
                                  <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200">
                                    <h5 className="font-bold text-lg text-dark-charcoal mb-4">Received Applications</h5>
                                    {receivedApps.filter(app => app.job_id === job.id).length > 0 ? (
                                       <div className="grid grid-cols-1 gap-4">
                                          {receivedApps.filter(app => app.job_id === job.id && (!selectedAppId || selectedAppId === app.id)).sort((a,b) => b.ats_score - a.ats_score).map(app => (
                                             <div key={app.id} className={`border border-[#489895]/30 rounded-2xl p-4 transition-colors bg-white ${selectedAppId === app.id ? 'shadow-md border-[#489895]' : 'hover:border-[#489895]'}`}>
                                               {selectedAppId === app.id && (
                                                  <button onClick={(e) => { e.stopPropagation(); setSelectedAppId(null); }} className="mb-4 inline-flex items-center gap-2 bg-gray-100 hover:bg-[#489895] hover:text-white text-[#113253] px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors shadow-sm w-max">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                                                    Back to Applications
                                                  </button>
                                               )}
                                               <div className={`flex justify-between items-center ${!selectedAppId ? 'cursor-pointer' : ''}`} onClick={() => !selectedAppId && setSelectedAppId(app.id)}>
                                                 <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                       <h6 className="font-bold text-lg text-[#113253]">{app.applicant_name} <span className="text-sm font-normal text-dark-charcoal">({app.ats_score}% Match)</span></h6>
                                                    </div>
                                                    <p className="text-sm font-black text-gray-500 uppercase tracking-widest">{app.company_name || 'the Company'}</p>
                                                    <p className="text-xs text-dark-charcoal">{app.email} • {app.mobile_number}</p>
                                                 </div>
                                                 <div className="flex items-center gap-2">
                                                    <p className={`text-xs font-black uppercase ${app.status === 'Shortlisted' ? 'text-green-600' : app.status === 'Rejected' ? 'text-red-500' : 'text-yellow-500'}`}>{app.status || 'Pending'}</p>
                                                 </div>
                                               </div>
                                  
                                               {selectedAppId === app.id && (
                                                 <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                                                   <div>
                                                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Applicant Details</p>
                                                      <div className="bg-white p-3 rounded shadow-sm border border-gray-100 text-sm">
                                                        <p><strong>Education:</strong> <span className="capitalize">{app.education || 'N/A'}</span></p>
                                                        <p><strong>Experience:</strong> {app.experience || 0} Years</p>
                                                        <p><strong>Location:</strong> {app.location || 'N/A'}</p>
                                                        <div className="mt-2 text-xs">
                                                          <strong>Skills:</strong> {app.skills ? app.skills.split(',').map((s,i)=><span key={i} className="inline-block bg-gray-100 px-2 py-0.5 rounded m-0.5">{s.trim()}</span>) : 'N/A'}
                                                        </div>
                                                        <div className="mt-2 text-xs text-black">
                                                          <strong>About / Hobbies:</strong> {app.about || 'N/A'}
                                                        </div>
                                                      </div>
                                                   </div>
                                                   <div>
                                                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">CV Analyzer Details</p>
                                                      <p className="text-sm border-l-4 border-[#489895] pl-3 py-1 mb-4 italic text-gray-700 bg-white shadow-sm p-2">"{app.cv_analysis}"</p>
                                                      
                                                      <div className="flex flex-col gap-2">
                                                         {app.cv_url && <button onClick={() => setViewCvModal(app.cv_url)} className="bg-[#e2f0ef] hover:bg-[#489895] text-dark-charcoal hover:text-white px-4 py-2 rounded font-bold text-xs text-center transition-colors shadow-sm w-full block">View or Download Uploaded CV</button>}
                                                         
                                                         {(!app.status || app.status === 'Pending') && (
                                                           <div className="flex gap-2 mt-2">
                                                             <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); setShortlistApp(app); }} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm text-white font-bold py-2 rounded text-xs transition-colors uppercase tracking-widest relative overflow-hidden group">
                                                               <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                                                               Interesting!
                                                             </motion.button>
                                                             <button onClick={() => updateStatus(app.id, 'Rejected')} className="flex-1 bg-red-500 hover:bg-red-600 shadow-sm text-white font-bold py-2 rounded text-xs transition-colors uppercase tracking-widest">Reject</button>
                                                           </div>
                                                         )}
                                                      </div>
                                                   </div>
                                                 </div>
                                               )}
                                             </div>
                                          ))}
                                       </div>
                                    ) : <p className="text-sm text-dark-charcoal italic bg-gray-50 p-4 rounded-xl border border-gray-100">No applicants yet.</p>}
                                  </div>
                               </div>
                            )}
                          </div>
                        ))}
                      </div>
                   ) : <p className="text-dark-charcoal font-medium text-sm">No jobs posted yet.</p>}
                 </div>
               )}

               {activeSlot === 'shortlisted' && (
                 <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 mb-8 animate-fadeIn relative">
                   <div className="flex justify-between items-center mb-6">
                     <h4 className="text-2xl font-black text-dark-charcoal">Shortlisted Profiles File</h4>
                     <button onClick={() => setActiveSlot(null)} className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-colors shadow-sm cursor-pointer">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                     </button>
                   </div>
                   
                   {receivedApps.filter(app => app.status === 'Shortlisted').length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {receivedApps.filter(app => app.status === 'Shortlisted').sort((a,b) => b.ats_score - a.ats_score).map(app => (
                           <div key={app.id} className="border border-green-200 rounded-xl p-4 bg-green-50/20">
                             <div>
                                <h6 className="font-bold text-dark-charcoal">{app.applicant_name} <span className="text-sm font-normal text-dark-charcoal">({app.ats_score}% Match)</span></h6>
                                <p className="text-xs text-dark-charcoal">{app.email} • {app.mobile_number} • <strong className="text-[#489895]">{app.role}</strong></p>
                             </div>
                           </div>
                        ))}
                      </div>
                   ) : <p className="text-sm text-dark-charcoal italic">No permanently shortlisted candidates yet.</p>}
                 </div>
               )}
             </div>

             {/* DANGER ZONE */}
             <div className="mt-12 pt-8 border-t border-red-100">
               <h3 className="text-xl font-black text-red-500 mb-2">Danger Zone</h3>
               <p className="text-sm font-medium text-dark-charcoal mb-6">Once you delete your account, there is no going back. Please be certain.</p>
               
               {destroyStep === 0 && (
                 <button onClick={() => setDestroyStep(1)} className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 hover:border-red-500 transition-all px-6 py-2 rounded-xl font-bold tracking-widest uppercase text-[11px] shadow-sm">
                   Destroy Account Permanently
                 </button>
               )}

               {destroyStep === 1 && (
                  <form onSubmit={handleDestroyRequestOTP} className="space-y-4 max-w-sm bg-red-50 p-6 rounded-2xl border border-red-100">
                     <p className="text-xs font-bold text-red-600 leading-relaxed">Enter your Registered Email. An OTP will be sent there to verify your intent to strictly destroy this account.</p>
                     <input type="email" placeholder="Registered Email" required 
                            value={destroyData.identifier} onChange={(e) => setDestroyData({...destroyData, identifier: e.target.value})}
                            className="w-full bg-white border border-red-200 text-[#1f2937] font-bold rounded-xl py-3 px-4 outline-none focus:border-red-500 transition-all shadow-inner text-sm" />
                     <div className="flex space-x-2">
                        <button type="submit" disabled={sendingOtpState} className={`bg-red-500 hover:bg-red-600 text-white font-black px-6 py-2 rounded-xl shadow-md text-xs uppercase tracking-widest flex-1 ${sendingOtpState ? 'animate-pulse opacity-80' : ''}`}>{sendingOtpState ? 'Sending OTP...' : 'Send OTP'}</button>
                        <button type="button" onClick={() => setDestroyStep(0)} className="bg-white text-dark-charcoal hover:text-gray-800 font-bold px-6 py-2 rounded-xl border border-gray-200 text-xs">Cancel</button>
                     </div>
                  </form>
               )}

               {destroyStep === 2 && (
                  <form onSubmit={handleDestroyVerify} className="space-y-4 max-w-sm bg-red-50 p-6 rounded-2xl border border-red-100 animate-fadeIn">
                     <p className="text-xs font-bold text-red-600 leading-relaxed">Enter the OTP sent to <span className="font-black text-red-800">{destroyData.identifier}</span> to finalize destruction.</p>
                     
                     <div className="relative">
                        <input type="text" placeholder="Enter OTP" required 
                               value={destroyData.otp} onChange={(e) => setDestroyData({...destroyData, otp: e.target.value.replace(/\D/g, '')})}
                               className="w-full bg-white border border-red-200 text-[#1f2937] font-bold rounded-xl py-3 pl-4 pr-[100px] outline-none focus:border-red-500 transition-all shadow-inner text-sm" />
                        <button type="button" disabled={destroyTimer > 0} onClick={() => handleDestroyRequestOTP()}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-red-500 to-red-700 text-white px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 hover:scale-105 active:scale-95 shadow-md">
                           {destroyTimer > 0 ? `00:${destroyTimer < 10 ? '0':''}${destroyTimer}` : 'Resend'}
                        </button>
                     </div>

                     <div className="flex space-x-2">
                        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-2 rounded-xl shadow-md text-[10px] sm:text-xs uppercase tracking-widest flex-1 whitespace-nowrap">Confirm Destroy</button>
                        <button type="button" onClick={() => {setDestroyStep(0); setDestroyData({identifier:'', otp:''}); setDestroyTimer(0);}} className="bg-white text-dark-charcoal hover:text-gray-800 font-bold px-6 py-2 rounded-xl border border-gray-200 text-xs">Cancel</button>
                     </div>
                  </form>
               )}
             </div>

        </motion.div>
      </div>

      {/* View Avatar Modal */}
      {viewAvatarModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur animate-fadeIn transition-all duration-300 ease-in-out" onClick={() => setViewAvatarModal(null)}>
           <div className="relative w-full h-full flex justify-center items-center" onClick={e => e.stopPropagation()}>
              <button onClick={() => setViewAvatarModal(null)} className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-white hover:text-red-400 bg-black hover:bg-gray-900 rounded-full border-2 border-white/50 hover:border-red-400 z-[101] shadow-lg transition-colors cursor-pointer">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <img src={viewAvatarModal} alt="Full Profile" className="max-w-[100vw] max-h-[100vh] w-auto h-auto object-contain rounded-none pointer-events-none" />
           </div>
        </div>
      )}

      {/* Shortlist Interview Form Modal */}
      {shortlistApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#113253]/80 backdrop-blur p-4 animate-fadeIn">
           <div className="relative max-w-md w-full bg-white rounded-[32px] p-8 shadow-2xl overflow-hidden">
              <h3 className="text-2xl font-black text-dark-charcoal mb-4">Schedule Interview</h3>
              <p className="text-sm font-medium text-dark-charcoal mb-6">You are shortlisting <strong>{shortlistApp.applicant_name}</strong>. Please provide the interview details. This will be automatically emailed to the candidate and admin.</p>
              
              <form onSubmit={handleShortlistSubmit} className="space-y-4">
                <div>
                   <label className="text-xs font-black text-dark-charcoal uppercase tracking-widest">Date</label>
                   <input type="date" required min={new Date().toISOString().split("T")[0]} max="2100-12-31" value={interviewForm.date} onChange={e=>setInterviewForm({...interviewForm, date: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-black font-bold rounded-xl py-3 px-4 outline-none focus:border-[#4facfe]" />
                </div>
                <div>
                   <label className="text-xs font-black text-dark-charcoal uppercase tracking-widest">Time (12-Hour)</label>
                   <div className="flex gap-2 items-center">
                     <select required value={interviewForm.timeHour} onChange={e=>setInterviewForm({...interviewForm, timeHour: e.target.value})} className="flex-1 bg-gray-50 border border-gray-200 text-black font-bold rounded-xl py-3 px-4 outline-none focus:border-[#4facfe] appearance-none text-center">
                       {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                     </select>
                     <span className="font-bold">:</span>
                     <select required value={interviewForm.timeMin} onChange={e=>setInterviewForm({...interviewForm, timeMin: e.target.value})} className="flex-1 bg-gray-50 border border-gray-200 text-black font-bold rounded-xl py-3 px-4 outline-none focus:border-[#4facfe] appearance-none text-center">
                       {['00','15','30','45'].map(m => <option key={m} value={m}>{m}</option>)}
                     </select>
                     <select required value={interviewForm.timeAmPm} onChange={e=>setInterviewForm({...interviewForm, timeAmPm: e.target.value})} className="flex-1 bg-gray-50 border border-gray-200 text-black font-bold rounded-xl py-3 px-4 outline-none focus:border-[#4facfe] appearance-none text-center">
                       <option value="AM">AM</option>
                       <option value="PM">PM</option>
                     </select>
                   </div>
                </div>
                <div>
                   <label className="text-xs font-black text-dark-charcoal uppercase tracking-widest mb-1 block">Interview Mode</label>
                   <div className="flex gap-2">
                     <button type="button" onClick={() => setInterviewForm({...interviewForm, mode: 'Online'})} className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest border-2 transition-all ${interviewForm.mode === 'Online' ? 'bg-[#4facfe] border-[#4facfe] text-white shadow-md' : 'bg-transparent border-gray-200 text-gray-500 hover:border-blue-200'}`}>Online</button>
                     <button type="button" onClick={() => setInterviewForm({...interviewForm, mode: 'Offline'})} className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest border-2 transition-all ${interviewForm.mode === 'Offline' ? 'bg-[#113253] border-[#113253] text-white shadow-md' : 'bg-transparent border-gray-200 text-gray-500 hover:border-gray-400'}`}>Offline</button>
                   </div>
                </div>
                <div>
                   <label className="text-xs font-black text-dark-charcoal uppercase tracking-widest flex items-center gap-2">Interview Link or Full Complete Address <span className="text-red-500">*</span></label>
                   <input type="text" required value={interviewForm.place} onChange={e=>setInterviewForm({...interviewForm, place: e.target.value})} placeholder={interviewForm.mode === 'Online' ? "e.g. Google Meet link" : "e.g. Building Name, Street, City, Pin"} className="w-full bg-gray-50 border border-gray-200 text-black font-bold rounded-xl py-3 px-4 outline-none focus:border-[#4facfe] mt-1" />
                </div>
                <div className="flex gap-4 pt-4">
                   <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} type="submit" disabled={submittingStatus} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl shadow-lg transition-all uppercase tracking-[0.2em] text-xs">
                     {submittingStatus ? 'Sending Out...' : 'Shortlist App'}
                   </motion.button>
                   <button type="button" onClick={() => setShortlistApp(null)} disabled={submittingStatus} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-black font-bold py-4 rounded-xl transition-all text-xs">
                     Cancel
                   </button>
                </div>
              </form>
           </div>
        </div>
      )}
      {viewCvModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8 animate-fadeIn" onClick={() => setViewCvModal(null)}>
          <div className="w-full max-w-4xl h-[85vh] bg-white rounded-3xl overflow-hidden relative flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 bg-gradient-to-r from-[#113253] to-[#489895] text-white">
               <h3 className="font-bold text-xl px-2">Document Viewer</h3>
               <div className="flex gap-4">
                 <a href={viewCvModal} download="Applicant_CV" className="bg-white/20 hover:bg-white text-white hover:text-[#113253] px-4 py-1.5 rounded-xl text-sm font-bold transition-colors">Download</a>
                 <button onClick={() => setViewCvModal(null)} className="text-white hover:text-red-400 font-bold transition-colors">Close ✕</button>
               </div>
            </div>
            <div className="flex-grow w-full bg-gray-100 flex items-center justify-center p-6">
               {viewCvModal.startsWith('data:application/pdf') || viewCvModal.startsWith('data:text/') ? (
                 <iframe src={viewCvModal} className="w-full h-full border-0 rounded-xl shadow-inner bg-white" title="Document Viewer" />
               ) : viewCvModal.startsWith('data:image') ? (
                 <img src={viewCvModal} className="max-w-full max-h-full object-contain shadow-lg rounded-xl" alt="Document" />
               ) : (
                 <div className="text-center p-8 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-md">
                   <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                   </div>
                   <p className="font-bold text-[#113253]">Preview Unavailable</p>
                   <p className="text-sm text-gray-500 mt-2">This is a Word/Doc file which cannot be previewed directly in the browser. Please use the Download button above to read it on your device.</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {showCameraStream && (
        <div className="fixed inset-0 z-[110] bg-black/95 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(72,152,149,0.3)]">
               <video ref={videoRef} autoPlay playsInline className="w-full h-auto object-cover min-h-[300px]"></video>
               <button onClick={closeCamera} className="absolute top-4 right-4 bg-black/50 hover:bg-red-500 text-white rounded-full p-2 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
               </button>
            </div>
            <div className="mt-8 flex gap-6">
               <button onClick={capturePhoto} className="bg-[#489895] hover:bg-[#347875] text-white w-20 h-20 rounded-full border-4 border-white/20 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group">
                 <span className="w-14 h-14 bg-white rounded-full group-hover:scale-90 transition-transform"></span>
               </button>
            </div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-6">Position your face clearly</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
