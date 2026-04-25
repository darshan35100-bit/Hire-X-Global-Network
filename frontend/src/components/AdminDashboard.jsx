import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const { token, logout, login, user } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);

  const [activeSlot, setActiveSlot] = useState(null);
  
  // Data States
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [articles, setArticles] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  
  // Search States
  const [searchJob, setSearchJob] = useState('');
  const [searchUser, setSearchUser] = useState('');
  
  // Details States
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null); // { user, postedJobs, appliedJobs, feedbacks }

  // Credentials Change States
  const [credStep, setCredStep] = useState(0); 
  // 0: start, 1: req otp, 2: verify req otp, 3: enter new email, 4: verify new email otp, 5: new pass
  const [credData, setCredData] = useState({ reqOtp: ['', '', '', '', '', ''], newEmail: '', newEmailOtp: ['', '', '', '', '', ''], newPassword: '' });
  const [isSendingReqOtp, setIsSendingReqOtp] = useState(false);
  const [isSendingNewOtp, setIsSendingNewOtp] = useState(false);

  // Suggestion Reply States
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Admin Profile States
  const [adminProfile, setAdminProfile] = useState({ name: 'Main Admin', mobile_number: '', location: '', profile_picture: '', profile_progress: 0 });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showPicEdit, setShowPicEdit] = useState(false);
  const videoRef = React.useRef(null);
  const [showCameraStream, setShowCameraStream] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jRes, uRes, fRes, aRes, sRes] = await Promise.all([
        fetch('/api/admin/jobs', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/feedbacks', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/articles', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/suggestions', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if(jRes.ok) {
        let j = await jRes.json();
        setJobs(j.sort((a,b) => (a.company_name||'').localeCompare(b.company_name||'')));
      }
      if(uRes.ok) {
        let u = await uRes.json();
        setUsers(u.sort((a,b) => (a.name||'').localeCompare(b.name||'')));
      }
      if(fRes.ok) setFeedbacks(await fRes.json());
      if(aRes.ok) setArticles(await aRes.json());
      if(sRes.ok) setSuggestions(await sRes.json());
      
      const meRes = await fetch('/api/users/profile', { headers: { 'Authorization': `Bearer ${token}` } });
      if(meRes.ok) {
        const meData = await meRes.json();
        setAdminProfile({ 
          name: meData.name || 'Main Admin',
          mobile_number: meData.mobile_number || '', 
          location: meData.location || '', 
          profile_picture: meData.avatar || '',
          profile_progress: meData.profile_progress || 0
        });
      }
    } catch(err) {
      console.error(err);
      addNotification("Failed to load admin data", "error");
    }
  };

  const handleUserClick = async (uId) => {
    setSelectedUser(uId);
    try {
      const res = await fetch(`/api/admin/users/${uId}/details`, { headers: { 'Authorization': `Bearer ${token}` } });
      if(res.ok) setUserDetails(await res.json());
    } catch(err) {
      addNotification("Failed to fetch user details", "error");
    }
  };

  const deleteItem = async (type, id) => {
    if(!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      let endpoint = '';
      if(type === 'job') endpoint = `/api/jobs/${id}`;
      else if(type === 'user') endpoint = `/api/admin/users/${id}`;
      else if(type === 'feedback') endpoint = `/api/feedbacks/${id}`;
      else if(type === 'article') endpoint = `/api/articles/${id}`;
      else if(type === 'suggestion') endpoint = `/api/suggestions/${id}`;
      else if(type === 'application') endpoint = `/api/admin/applications/${id}`;

      const res = await fetch(endpoint, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if(res.ok) {
        addNotification(`${type} deleted successfully`, "success");
        if(type === 'user') { setUsers(users.filter(u=>u.id!==id)); setSelectedUser(null); setUserDetails(null); }
        else if(type === 'job') { setJobs(jobs.filter(j=>j.id!==id)); setSelectedJob(null); }
        else if(type === 'feedback') setFeedbacks(feedbacks.filter(f=>f.id!==id));
        else if(type === 'article') setArticles(articles.filter(a=>a.id!==id));
        else if(type === 'suggestion') setSuggestions(suggestions.filter(s=>s.id!==id));
        else if(type === 'application') {
          if(userDetails) setUserDetails({...userDetails, appliedJobs: userDetails.appliedJobs.filter(a=>a.id!==id)});
        }
      } else {
        addNotification(`Failed to delete ${type}`, "error");
      }
    } catch(err) {
      addNotification("Network Error", "error");
    }
  };

  // Credential Handlers
  const handleReqOtp = async () => {
    setIsSendingReqOtp(true);
    try {
      const res = await fetch('/api/auth/admin-change-req-otp', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      if(res.ok) {
        addNotification("OTP Sent to current email", "success");
        setCredStep(1);
      } else addNotification("Failed to send OTP", "error");
    } catch(err) { addNotification("Network Error", "error"); }
    setIsSendingReqOtp(false);
  };
  
  const verifyReqOtp = async () => {
    try {
      const otpStr = credData.reqOtp.join('');
      const res = await fetch('/api/auth/admin-verify-req-otp', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ otp: otpStr }) });
      if(res.ok) {
        addNotification("Verified!", "success");
        setCredStep(2);
      } else addNotification("Invalid OTP", "error");
    } catch(err) { addNotification("Network Error", "error"); }
  };

  const handleNewEmailOtp = async (e) => {
    e.preventDefault();
    setIsSendingNewOtp(true);
    try {
      const res = await fetch('/api/auth/admin-new-email-otp', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ newEmail: credData.newEmail }) });
      if(res.ok) {
        addNotification("OTP Sent to new email", "success");
        setCredStep(3);
      } else {
        const d = await res.json();
        addNotification(d.error || "Failed", "error");
      }
    } catch(err) { addNotification("Network Error", "error"); }
    setIsSendingNewOtp(false);
  };

  const verifyNewEmailOtp = async () => {
    // This is no longer used individually, handled by submitNewCredentials
  };

  const submitNewCredentials = async () => {
    try {
      const otpStr = credData.newEmailOtp.join('');
      const res = await fetch('/api/auth/admin-update-credentials', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify({ newEmail: credData.newEmail, newPassword: credData.newPassword, otp: otpStr }) 
      });
      if(res.ok) {
        addNotification("Credentials updated! Old profile deleted. Please login again.", "success");
        logout();
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      } else {
        addNotification("Invalid OTP or Update Failed", "error");
      }
    } catch(err) { addNotification("Network Error", "error"); }
  };

  useEffect(() => {
    if (credStep === 1 && credData.reqOtp.every(d => d !== '')) {
      verifyReqOtp();
    }
  }, [credData.reqOtp, credStep]);

  useEffect(() => {
    if (credStep === 3 && credData.newEmailOtp.every(d => d !== '')) {
      submitNewCredentials();
    }
  }, [credData.newEmailOtp, credStep]);

  const handleOtpChange = (index, value, type, e) => {
    if (e && e.key === 'Backspace') {
      const newArr = [...credData[type]];
      if (!newArr[index] && index > 0) {
        document.getElementById(`otp-${type}-${index - 1}`).focus();
        newArr[index - 1] = '';
        setCredData({...credData, [type]: newArr});
      } else {
        newArr[index] = '';
        setCredData({...credData, [type]: newArr});
      }
      return;
    }
    if (!/^[0-9]?$/.test(value)) return;
    const newArr = [...credData[type]];
    newArr[index] = value;
    setCredData({...credData, [type]: newArr});
    if (value && index < 5) {
      document.getElementById(`otp-${type}-${index + 1}`).focus();
    }
  };

  const handleReplySubmit = async (sId, e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/suggestions/${sId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ replyText })
      });
      if (res.ok) {
        addNotification("Reply sent to user via email!", "success");
        setReplyingTo(null);
        setReplyText('');
      } else {
        addNotification("Failed to send reply", "error");
      }
    } catch(err) { addNotification("Error sending reply", "error"); }
  };

  const handleAdminProfileUpdate = async (e) => {
    e.preventDefault();
    if(!adminProfile.name || !adminProfile.mobile_number || !adminProfile.location || !adminProfile.profile_picture) {
      addNotification("Please complete all profile details (Name, Mobile, Location, Picture) to proceed.", "error");
    }
    setIsUpdatingProfile(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: adminProfile.name,
          mobile_number: adminProfile.mobile_number,
          location: adminProfile.location,
          avatar: adminProfile.profile_picture,
          about: "Global Operations Overseer for Hire-X",
          education: "Master's Degree",
          experience: 10,
          skills: "Management, Security, Oversight"
        })
      });
      if(res.ok) {
        const data = await res.json();
        setAdminProfile({...adminProfile, profile_progress: data.profile_progress});
        login(data, token); // update navbar
        addNotification("Admin profile & Footer Contact Updated!", "success");
      } else addNotification("Update Failed", "error");
    } catch(err) { addNotification("Error updating", "error"); }
    setIsUpdatingProfile(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        setAdminProfile({...adminProfile, profile_picture: ev.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowPicEdit(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setShowCameraStream(true);
      setTimeout(() => { if(videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch(err) { addNotification("Camera not accessible", "error"); }
  };

  const capturePhoto = () => {
    if(videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      setAdminProfile({...adminProfile, profile_picture: canvas.toDataURL('image/jpeg', 0.8)});
      closeCamera();
    }
  };

  const closeCamera = () => {
    if(videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setShowCameraStream(false);
  };

  useEffect(() => {
    if(credStep === 1) {
       if(credData.reqOtp.every(x=>x!=='')) verifyReqOtp();
    } else if(credStep === 3) {
       if(credData.newEmailOtp.every(x=>x!=='')) verifyNewEmailOtp();
    }
  }, [credData.reqOtp, credData.newEmailOtp, credStep]);


  const SlotButton = ({ id, label, color, count }) => (
    <button onClick={() => setActiveSlot(activeSlot === id ? null : id)} className={`bg-white border-2 ${activeSlot === id ? 'border-'+color+'-500 shadow-lg scale-105' : 'border-gray-200'} rounded-2xl p-6 text-left transition-all hover:border-${color}-500 hover:shadow-md`}>
      <h4 className={`text-xl font-bold text-${color}-600 mb-2`}>{label}</h4>
      <p className="text-4xl font-black text-dark-charcoal">{count}</p>
      <p className="text-xs text-gray-400 font-bold uppercase mt-2 tracking-widest">{activeSlot === id ? 'Close Slot' : 'Click to View'}</p>
    </button>
  );

  return (
    <div className="flex-grow bg-gradient-to-br from-[#0F5A4E]/5 to-[#113253]/5 font-montserrat text-dark-charcoal p-8 w-full max-w-7xl mx-auto">
      
      {/* Top Section: Dashboard Title & Admin Profile side-by-side */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex-1 bg-gradient-to-r from-[#113253] to-[#489895] rounded-[32px] p-8 text-white shadow-xl flex flex-col justify-center bg-opacity-90 backdrop-blur-xl border border-white/20">
           <h1 className="text-4xl font-black font-playfair mb-2 tracking-tight">Admin Interface</h1>
           <p className="text-sm font-medium opacity-90 tracking-widest uppercase">Global Overseer Operations</p>
        </div>
        
        <div className="lg:w-[400px] bg-white/60 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white flex flex-col justify-between relative overflow-hidden">
           
           {/* Progress Ring Background */}
           <div className="absolute top-[-20%] right-[-10%] opacity-10 pointer-events-none">
              <svg width="200" height="200" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="45" fill="none" stroke="#113253" strokeWidth="10" strokeDasharray={`${adminProfile.profile_progress * 2.82} 282`} transform="rotate(-90 50 50)" />
              </svg>
           </div>
           
           <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="font-bold text-[#113253] text-sm uppercase tracking-widest">Public Contact Info</h3>
              <span className={`text-xs font-black px-2 py-1 rounded-full ${adminProfile.profile_progress >= 100 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{adminProfile.profile_progress}%</span>
           </div>

           <form onSubmit={handleAdminProfileUpdate} className="flex flex-col gap-3 relative z-10">
              <div className="flex items-center gap-4 mb-2">
                 <div className="relative group cursor-pointer" onClick={() => setShowPicEdit(true)}>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#113253] to-[#489895] flex items-center justify-center text-white font-black text-2xl overflow-hidden shadow-md border-2 border-white">
                       {adminProfile.profile_picture ? <img src={adminProfile.profile_picture} className="w-full h-full object-cover" /> : 'A'}
                    </div>
                    {/* Add Icon Edge */}
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200">
                      <svg className="w-3 h-3 text-[#113253]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                    </div>
                 </div>
                 <div className="flex flex-col w-full">
                    <input type="text" placeholder="Admin Name" value={adminProfile.name} onChange={e=>setAdminProfile({...adminProfile, name: e.target.value})} className="bg-transparent border-b border-gray-300 outline-none text-sm font-black text-[#1a2f2b] focus:border-[#489895] mb-1 pb-1 w-full" />
                    <p className="text-xs text-gray-500 mb-1">{user.email}</p>
                 </div>
              </div>
              
              <input type="text" placeholder="Phone Number" value={adminProfile.mobile_number} onChange={e=>setAdminProfile({...adminProfile, mobile_number: e.target.value})} className="w-full bg-white/80 border border-gray-200 rounded-xl p-2 outline-none focus:border-[#489895] text-xs font-bold" />
              <input type="text" placeholder="Location / Address" value={adminProfile.location} onChange={e=>setAdminProfile({...adminProfile, location: e.target.value})} className="w-full bg-white/80 border border-gray-200 rounded-xl p-2 outline-none focus:border-[#489895] text-xs font-bold" />
              
              <button disabled={isUpdatingProfile} type="submit" className="w-full bg-[#113253] text-white py-2 rounded-xl font-bold uppercase shadow-md hover:bg-opacity-90 text-xs tracking-widest mt-2 transition-all">
                {isUpdatingProfile ? 'Saving...' : 'Commit Changes'}
              </button>
           </form>
        </div>
      </div>

      {adminProfile.profile_progress < 100 ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center shadow-sm">
           <h3 className="text-red-600 font-black text-xl mb-2">Action Required</h3>
           <p className="text-red-500 font-bold text-sm">Please complete your Main Admin profile (Name, Mobile, Location, Picture) to 100% to unlock dashboard operations.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <SlotButton id="jobs" label="Job Postings" color="blue" count={jobs.length} />
        <SlotButton id="users" label="Registered Users" color="green" count={users.length} />
        <SlotButton id="feedbacks" label="User Feedbacks" color="yellow" count={feedbacks.length} />
        <SlotButton id="articles" label="Articles/Insights" color="purple" count={articles.length} />
        <SlotButton id="suggestions" label="Suggestions" color="pink" count={suggestions.length} />
        <SlotButton id="creds" label="Change Credentials" color="red" count={"⚙️"} />
      </div>

      <AnimatePresence>
        {activeSlot === 'jobs' && (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 mb-8">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-black text-dark-charcoal">All Job Postings</h3>
               <input type="text" placeholder="Search Jobs..." value={searchJob} onChange={e=>setSearchJob(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-blue-500 text-sm" />
            </div>
            <div className="grid grid-cols-1 gap-4">
               {jobs.filter(j=>(j.title+j.company_name).toLowerCase().includes(searchJob.toLowerCase())).map(j => (
                 <div key={j.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-white hover:border-blue-500 transition-all shadow-sm">
                   <div className="flex justify-between items-center cursor-pointer" onClick={() => setSelectedJob(selectedJob === j.id ? null : j.id)}>
                      <div>
                        <h4 className="font-bold text-lg text-dark-charcoal">{j.title}</h4>
                        <p className="text-sm text-gray-500 uppercase tracking-widest">{j.company_name || 'N/A'}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteItem('job', j.id); }} className="bg-red-100 hover:bg-red-500 text-red-600 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">Delete</button>
                   </div>
                   {selectedJob === j.id && (
                     <div className="mt-4 pt-4 border-t border-gray-200 text-sm">
                       <p><strong>Location:</strong> {j.location}</p>
                       <p><strong>End Date:</strong> {j.end_date ? new Date(j.end_date).toLocaleDateString() : 'None'}</p>
                       <p className="mt-2 whitespace-pre-wrap text-gray-600 bg-white p-3 rounded border border-gray-100">{j.description}</p>
                     </div>
                   )}
                 </div>
               ))}
            </div>
          </motion.div>
        )}

        {activeSlot === 'users' && (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 mb-8">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-black text-dark-charcoal">All Registered Users</h3>
               <input type="text" placeholder="Search Users..." value={searchUser} onChange={e=>setSearchUser(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-green-500 text-sm" />
            </div>
            <div className="grid grid-cols-1 gap-4">
               {users.filter(u=>(u.name+u.email).toLowerCase().includes(searchUser.toLowerCase()) && u.role !== 'main_admin').map(u => (
                 <div key={u.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-white hover:border-green-500 transition-all shadow-sm">
                   <div className="flex justify-between items-center cursor-pointer" onClick={() => selectedUser === u.id ? setSelectedUser(null) : handleUserClick(u.id)}>
                      <div>
                        <h4 className="font-bold text-lg text-dark-charcoal">{u.name}</h4>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteItem('user', u.id); }} className="bg-red-100 hover:bg-red-500 text-red-600 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">Destroy Account</button>
                   </div>
                   
                   {selectedUser === u.id && userDetails && userDetails.user.id === u.id && (
                     <div className="mt-4 pt-4 border-t border-gray-200 bg-white/50 backdrop-blur-md rounded-2xl p-6 shadow-inner border border-white/60">
                       <h5 className="font-bold text-[#113253] mb-3 uppercase tracking-widest text-xs flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> User Profile Meta</h5>
                       <div className="bg-white/80 p-4 rounded-xl border border-gray-100 text-sm mb-6 flex flex-wrap gap-x-8 gap-y-2 shadow-sm">
                          <p><strong>Mobile:</strong> {u.mobile_number}</p>
                          <p><strong>Location:</strong> {u.location}</p>
                          <p><strong>Education:</strong> {u.education}</p>
                          <p><strong>Experience:</strong> {u.experience} yrs</p>
                       </div>
                       
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         <div>
                           <h5 className="font-bold text-[#113253] mb-3 uppercase tracking-widest text-xs">Posted Jobs</h5>
                           <div className="flex flex-col gap-2">
                             {userDetails.postedJobs.map(pj => (
                               <div key={pj.id} className="bg-white/80 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-sm shadow-sm">
                                 <span className="font-medium text-dark-charcoal">{pj.title}</span>
                                 <button onClick={()=>deleteItem('job', pj.id)} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1 rounded-lg text-[10px] uppercase font-bold transition-colors ml-2 shadow-sm">Delete</button>
                               </div>
                             ))}
                             {userDetails.postedJobs.length === 0 && <p className="text-xs text-gray-400 italic">No jobs posted.</p>}
                           </div>
                         </div>
                         <div>
                           <h5 className="font-bold text-[#113253] mb-3 uppercase tracking-widest text-xs">Applied Jobs</h5>
                           <div className="flex flex-col gap-2">
                             {userDetails.appliedJobs.map(aj => (
                               <div key={aj.id} className="bg-white/80 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-sm shadow-sm">
                                 <span className="font-medium text-dark-charcoal">{aj.title} <span className="text-gray-400">({aj.company_name})</span></span>
                                 <button onClick={()=>deleteItem('application', aj.id)} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1 rounded-lg text-[10px] uppercase font-bold transition-colors ml-2 shadow-sm">Delete</button>
                               </div>
                             ))}
                             {userDetails.appliedJobs.length === 0 && <p className="text-xs text-gray-400 italic">No jobs applied.</p>}
                           </div>
                         </div>
                         <div className="lg:col-span-2 mt-2">
                           <h5 className="font-bold text-[#113253] mb-3 uppercase tracking-widest text-xs">Feedbacks Submitted</h5>
                           <div className="flex flex-col gap-2">
                             {userDetails.feedbacks.map(f => (
                               <div key={f.id} className="bg-white/80 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-sm shadow-sm">
                                 <span className="truncate max-w-[70%] font-medium text-gray-700">"{f.text}"</span>
                                 <button onClick={()=>deleteItem('feedback', f.id)} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1 rounded-lg text-[10px] uppercase font-bold transition-colors ml-2 shadow-sm">Delete</button>
                               </div>
                             ))}
                             {userDetails.feedbacks.length === 0 && <p className="text-xs text-gray-400 italic">No feedbacks submitted.</p>}
                           </div>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               ))}
            </div>
          </motion.div>
        )}

        {activeSlot === 'feedbacks' && (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 mb-8">
            <h3 className="text-2xl font-black text-dark-charcoal mb-6">Feedbacks</h3>
            <div className="grid grid-cols-1 gap-4">
               {feedbacks.map(f => (
                 <div key={f.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-dark-charcoal">{f.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">{new Date(f.created_at).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-100">{f.text}</p>
                    </div>
                    <button onClick={() => deleteItem('feedback', f.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">Delete</button>
                 </div>
               ))}
            </div>
          </motion.div>
        )}

        {activeSlot === 'articles' && (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 mb-8">
            <h3 className="text-2xl font-black text-dark-charcoal mb-6">Articles & Insights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
               {articles.map(a => (
                 <ArticleAdminCard key={a.id} article={a} onDelete={() => deleteItem('article', a.id)} />
               ))}
            </div>
          </motion.div>
        )}

        {activeSlot === 'suggestions' && (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 mb-8">
            <h3 className="text-2xl font-black text-dark-charcoal mb-6">Suggestions</h3>
            <div className="flex flex-col gap-4">
               {suggestions.map(s => (
                 <div key={s.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex justify-between items-start">
                    <div className="flex-1 mr-4">
                      <h4 className="font-bold text-dark-charcoal">{s.name} ({s.email})</h4>
                      <p className="text-xs text-gray-500 mb-2">{new Date(s.created_at).toLocaleString()}</p>
                      <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-100">{s.text}</p>
                    </div>
                     <div className="flex flex-col gap-2 min-w-[120px]">
                        {replyingTo === s.id ? (
                          <form onSubmit={(e) => handleReplySubmit(s.id, e)} className="flex flex-col gap-2">
                             <textarea required value={replyText} onChange={e=>setReplyText(e.target.value)} rows="2" placeholder="Admin reply..." className="w-full text-xs p-2 border border-gray-200 rounded resize-none focus:border-blue-500 outline-none"></textarea>
                             <div className="flex gap-1">
                                <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded text-[10px] font-bold flex-1 uppercase tracking-widest">Send</button>
                                <button type="button" onClick={()=>setReplyingTo(null)} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-[10px] font-bold flex-1 uppercase tracking-widest">Cancel</button>
                             </div>
                          </form>
                        ) : (
                          <>
                             <button onClick={() => setReplyingTo(s.id)} className="bg-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors w-full uppercase tracking-widest shadow-sm">Reply</button>
                             <button onClick={() => deleteItem('suggestion', s.id)} className="bg-red-100 text-red-600 hover:bg-red-500 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors w-full uppercase tracking-widest shadow-sm">Delete</button>
                          </>
                        )}
                     </div>
                 </div>
               ))}
            </div>
          </motion.div>
        )}

        {activeSlot === 'creds' && (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 mb-8">
            <h3 className="text-2xl font-black text-dark-charcoal mb-6">Change Credentials</h3>
            <div className="max-w-md mx-auto">
              {credStep === 0 && (
                <button 
                  onClick={handleReqOtp} 
                  disabled={isSendingReqOtp}
                  className={`w-full text-white py-3 rounded-xl font-bold uppercase tracking-widest shadow-md transition-all ${isSendingReqOtp ? 'bg-gray-500 cursor-not-allowed animate-pulse' : 'bg-[#113253] hover:bg-opacity-90'}`}
                >
                  {isSendingReqOtp ? 'Sending OTP...' : 'Start Credential Change'}
                </button>
              )}
              {credStep === 1 && (
                <div className="text-center">
                  <p className="mb-4 text-sm font-bold text-center">Enter OTP sent to your current email:</p>
                  <div className="flex justify-center gap-2 mb-6">
                    {credData.reqOtp.map((digit, idx) => (
                      <input key={idx} id={`otp-reqOtp-${idx}`} type="text" maxLength="1" value={digit} onKeyDown={(e)=>handleOtpChange(idx, e.target.value, 'reqOtp', e)} onChange={e=>handleOtpChange(idx, e.target.value, 'reqOtp', null)} className="w-12 h-14 text-center border-[3px] border-[#113253] bg-white text-[#113253] rounded-xl text-2xl font-black focus:border-green-500 focus:bg-green-50 focus:text-green-700 transition-all outline-none shadow-md" />
                    ))}
                  </div>
                  <button onClick={() => setCredStep(0)} className="w-full text-xs font-bold text-gray-400 uppercase hover:text-gray-800">Cancel & Go Back</button>
                </div>
              )}
              {credStep === 2 && (
                <form onSubmit={handleNewEmailOtp} className="space-y-4">
                  <div>
                    <p className="text-sm font-bold mb-1">Enter your new Email ID:</p>
                    <input type="email" required value={credData.newEmail} onChange={e=>setCredData({...credData, newEmail: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-[#4facfe]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold mb-1">Enter your new Password:</p>
                    <input type="password" required minLength={6} value={credData.newPassword} onChange={e=>setCredData({...credData, newPassword: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-[#4facfe]" />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSendingNewOtp}
                    className={`w-full text-white py-4 rounded-xl font-bold uppercase shadow-md text-sm tracking-widest mt-4 transition-all ${isSendingNewOtp ? 'bg-gray-500 cursor-not-allowed animate-pulse' : 'bg-[#113253] hover:bg-opacity-90'}`}
                  >
                    {isSendingNewOtp ? 'Sending OTP...' : 'Send OTP to New Email'}
                  </button>
                  <button type="button" onClick={() => setCredStep(0)} className="w-full text-xs font-bold text-gray-400 uppercase hover:text-gray-800 mt-4 text-center">Cancel & Go Back</button>
                </form>
              )}
              {credStep === 3 && (
                <div className="text-center">
                  <p className="mb-4 text-sm font-bold text-center">Enter OTP sent to {credData.newEmail}:</p>
                  <div className="flex justify-center gap-2 mb-6">
                    {credData.newEmailOtp.map((digit, idx) => (
                      <input key={idx} id={`otp-newEmailOtp-${idx}`} type="text" maxLength="1" value={digit} onKeyDown={(e)=>handleOtpChange(idx, e.target.value, 'newEmailOtp', e)} onChange={e=>handleOtpChange(idx, e.target.value, 'newEmailOtp', null)} className="w-12 h-14 text-center border-[3px] border-[#113253] bg-white text-[#113253] rounded-xl text-2xl font-black focus:border-green-500 focus:bg-green-50 focus:text-green-700 transition-all outline-none shadow-md" />
                    ))}
                  </div>
                  <button onClick={() => setCredStep(0)} className="w-full text-xs font-bold text-gray-400 uppercase hover:text-gray-800">Cancel & Go Back</button>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
        </>
      )}

      {/* Admin Profile Pic Modal & Camera */}
      <AnimatePresence>
        {showPicEdit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={(e) => { e.stopPropagation(); setShowPicEdit(false); }}>
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.9 }}
              className="bg-[#ffe4c4] p-8 rounded-3xl shadow-2xl relative w-full max-w-[340px] flex flex-col items-center text-center border border-white/50" onClick={e => e.stopPropagation()}>
              <div className="w-full flex justify-end mb-2">
                <button onClick={() => setShowPicEdit(false)} className="text-red-500 font-bold uppercase tracking-widest text-[13px] hover:text-red-700 transition-colors">Close</button>
              </div>
              <div className="w-24 h-24 rounded-full bg-white border-[3px] border-white shadow-md mb-8 overflow-hidden flex items-center justify-center bg-gray-100">
                 {adminProfile.profile_picture ? <img src={adminProfile.profile_picture} className="w-full h-full object-cover" /> : <span className="text-4xl text-gray-300">👤</span>}
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
                 <button onClick={() => { setShowPicEdit(false); setAdminProfile({...adminProfile, profile_picture: ''}); }} className="flex flex-col items-center justify-center cursor-pointer w-[80px] h-[80px] bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group border border-gray-100">
                   <span className="text-2xl text-red-500 mb-1 group-hover:scale-110 transition-transform">🗑️</span>
                   <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Remove</span>
                 </button>
              </div>
            </motion.div>
          </div>
        )}
        
        {showCameraStream && (
          <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-4">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg rounded-2xl shadow-2xl mb-6 bg-gray-900 border-4 border-[#4facfe]"></video>
            <div className="flex gap-4">
              <button onClick={capturePhoto} className="px-8 py-4 bg-[#4facfe] text-white font-black rounded-full shadow-lg hover:bg-blue-600 transition-all uppercase tracking-widest text-sm">Capture</button>
              <button onClick={closeCamera} className="px-8 py-4 bg-red-500 text-white font-black rounded-full shadow-lg hover:bg-red-600 transition-all uppercase tracking-widest text-sm">Cancel</button>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

const ArticleAdminCard = ({ article, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">
       <div className={`h-32 w-full relative bg-cover bg-center ${!article.image_url ? 'bg-gradient-to-tr from-[#113253] to-[#489895]' : ''}`} style={article.image_url ? { backgroundImage: `url(${article.image_url})` } : {}}>
          <div className="absolute inset-0 bg-black/30"></div>
       </div>
       <div className="p-5 flex flex-col flex-grow relative bg-white mt-[-20px] rounded-t-[24px]">
         <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">{article.category}</p>
         <h5 className="font-bold text-lg text-dark-charcoal mt-1 mb-2 leading-tight">{article.title}</h5>
         <p className="text-xs text-gray-500 line-clamp-2">{article.description}</p>
         {expanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-700 bg-white p-2 rounded">
              {article.content || "No extended content available for this insight."}
            </div>
         )}
       </div>
       <div className="mt-4 flex justify-between items-center px-5 pb-5">
          <button onClick={() => setExpanded(!expanded)} className="text-purple-600 text-[10px] font-black uppercase tracking-[0.2em] hover:text-purple-800 transition-colors bg-purple-50 px-3 py-1.5 rounded-full">{expanded ? 'Collapse Read' : 'Expand Read'}</button>
          <button onClick={onDelete} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-colors shadow-sm">Delete</button>
       </div>
    </div>
  );
};

export default AdminDashboard;
