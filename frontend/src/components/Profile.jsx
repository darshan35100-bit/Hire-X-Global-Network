import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const { token, login, logout, user } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', mobile_number: '', education: '', experience: 0, about: '', skills: '', location: '', avatar: ''
  });
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { isRegister: true } });
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
          avatar: data.avatar || ''
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

  if(loading) return <div className="p-20 text-center font-bold text-[#113253]">Loading Global Identity...</div>;
  if(!profile) return <div className="p-20 text-center font-bold text-red-500">Failed to load profile.</div>;

  const progress = profile.profile_progress || 30;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex-grow bg-[#F1F5F9] relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      
      {/* Decorative BG */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[50%] bg-[#4facfe] rounded-full filter blur-[150px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[40%] bg-[#806bf8] rounded-full filter blur-[120px] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-5xl relative z-10 flex flex-col md:flex-row gap-8">
        
        {/* Left Col - Progress & Avatar Overview */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
           className="w-full md:w-1/3 flex flex-col gap-6">
          
          <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center flex flex-col items-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#113253] to-[#489895]"></div>
            
            <div className="relative w-32 h-32 rounded-full mt-10 bg-white p-1 shadow-xl mb-4 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white bg-gray-100 flex items-center justify-center relative">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-[#113253]">{profile.name.charAt(0).toUpperCase()}</span>
                )}
                {/* Status dot */}
                <div className="absolute bottom-1 right-3 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-[#113253] mt-2">{profile.name}</h2>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{profile.role}</p>

            <div className="mt-8 pt-6 border-t border-gray-100 w-full">
              <p className="text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Global Profile Strength</p>
              
              {/* Circular Progress SVG */}
              <div className="flex items-center justify-center relative w-32 h-32 mx-auto mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-200" />
                  <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="text-[#806bf8] transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-[#113253]">{progress}%</span>
                </div>
              </div>
              <p className="text-[11px] font-medium text-gray-500 leading-tight">Complete your profile to increase your visibility to top-tier employers.</p>
            </div>
          </div>
        </motion.div>

        {/* Right Col - Details & Edit Form */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
           className="w-full md:w-2/3 bg-white/80 backdrop-blur-2xl border border-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
           
           <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
             <h3 className="text-3xl font-black text-[#113253]">Identity Details</h3>
             {!isEditing ? (
               <button onClick={() => setIsEditing(true)} className="bg-[#e2f0ef] hover:bg-[#489895] text-[#489895] hover:text-white transition-colors px-6 py-2 rounded-full font-bold text-sm shadow-sm flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                 Update Profile
               </button>
             ) : (
               <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-red-500 font-bold text-sm tracking-widest uppercase transition-colors">
                 Cancel Edit
               </button>
             )}
           </div>

           {!isEditing ? (
             <div className="space-y-8">
               
               <div>
                 <p className="text-xs font-black text-[#806bf8] uppercase tracking-widest mb-2 shadow-sm inline-block px-3 py-1 bg-[#f0ecfc] rounded-md">Professional Summary</p>
                 <p className="text-gray-600 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">{profile.about || 'No summary provided yet. Add one to stand out.'}</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                   <p className="text-xs font-black text-[#489895] uppercase tracking-widest mb-2 shadow-sm inline-block px-3 py-1 bg-[#e2f0ef] rounded-md">Location</p>
                   <p className="text-[#113253] font-bold text-lg">{profile.location || 'Not specified'}</p>
                 </div>
                 <div>
                   <p className="text-xs font-black text-[#489895] uppercase tracking-widest mb-2 shadow-sm inline-block px-3 py-1 bg-[#e2f0ef] rounded-md">Contact</p>
                   <p className="text-[#113253] font-bold text-sm mb-1">📱 {profile.mobile_number || '+0000000000'}</p>
                   <p className="text-[#113253] font-bold text-sm">📧 {profile.email || 'N/A'}</p>
                 </div>
                 <div>
                   <p className="text-xs font-black text-[#489895] uppercase tracking-widest mb-2 shadow-sm inline-block px-3 py-1 bg-[#e2f0ef] rounded-md">Experience</p>
                   <p className="text-[#113253] font-bold text-lg">{profile.experience}+ Years Tracking</p>
                 </div>
                 <div>
                   <p className="text-xs font-black text-[#489895] uppercase tracking-widest mb-2 shadow-sm inline-block px-3 py-1 bg-[#e2f0ef] rounded-md">Core Skills</p>
                   {profile.skills ? (
                     <div className="flex flex-wrap gap-2 mt-1">
                       {profile.skills.split(',').map((s, i) => (
                         <span key={i} className="px-3 py-1 bg-white border border-gray-200 text-[#113253] font-bold text-xs rounded-full shadow-sm">{s.trim()}</span>
                       ))}
                     </div>
                   ) : <p className="text-gray-500 font-medium text-sm">No skills added.</p>}
                 </div>
                 <div>
                   <p className="text-xs font-black text-[#489895] uppercase tracking-widest mb-2 shadow-sm inline-block px-3 py-1 bg-[#e2f0ef] rounded-md">Education</p>
                   <p className="text-[#113253] font-bold text-lg capitalize">{profile.education || 'None'}</p>
                 </div>
               </div>
             </div>
           ) : (
             <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-1">
                   <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Full Name</label>
                   <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-gray-200 text-[#113253] font-bold rounded-xl py-3 px-4 outline-none focus:border-[#806bf8] focus:ring-1 focus:ring-[#806bf8] transition-all shadow-inner" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Mobile Number</label>
                   <input type="tel" value={formData.mobile_number} onChange={e=>setFormData({...formData, mobile_number: e.target.value})} className="w-full bg-white border border-gray-200 text-[#113253] font-bold rounded-xl py-3 px-4 outline-none focus:border-[#4facfe] focus:ring-1 focus:ring-[#4facfe] transition-all shadow-inner" />
                 </div>
                 <div className="space-y-1 md:col-span-2">
                   <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Location (City, Country)</label>
                   <input type="text" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} className="w-full bg-white border border-gray-200 text-[#113253] font-bold rounded-xl py-3 px-4 outline-none focus:border-[#489895] focus:ring-1 focus:ring-[#489895] transition-all shadow-inner" />
                 </div>
               </div>

               <div className="space-y-1">
                 <label className="text-xs font-black text-gray-500 uppercase tracking-widest">About Me</label>
                 <textarea rows="3" value={formData.about} onChange={e=>setFormData({...formData, about: e.target.value})} className="w-full bg-white border border-gray-200 text-[#113253] font-medium rounded-xl py-3 px-4 outline-none focus:border-[#806bf8] focus:ring-1 focus:ring-[#806bf8] transition-all shadow-inner"></textarea>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-1">
                   <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Education Level</label>
                   <select value={formData.education} onChange={e=>setFormData({...formData, education: e.target.value})} className="w-full bg-white border border-gray-200 text-[#113253] font-bold rounded-xl py-3 px-4 outline-none focus:border-[#806bf8] transition-all shadow-inner">
                     <option value="None">None</option>
                     <option value="High School">High School</option>
                     <option value="Bachelors">Bachelors Degree</option>
                     <option value="Masters">Masters Degree</option>
                     <option value="PhD">PhD</option>
                   </select>
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Experience (Years)</label>
                   <input type="number" min="0" value={formData.experience} onChange={e=>setFormData({...formData, experience: e.target.value})} className="w-full bg-white border border-gray-200 text-[#113253] font-bold rounded-xl py-3 px-4 outline-none focus:border-[#489895] transition-all shadow-inner" />
                 </div>
               </div>

               <div className="space-y-1">
                 <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Skills (Comma Separated)</label>
                 <input type="text" placeholder="e.g. React, Node.js, Design" value={formData.skills} onChange={e=>setFormData({...formData, skills: e.target.value})} className="w-full bg-white border border-gray-200 text-[#113253] font-bold rounded-xl py-3 px-4 outline-none focus:border-[#806bf8] transition-all shadow-inner" />
               </div>

               <div className="space-y-1">
                 <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Profile Picture (Image Upload)</label>
                 <input type="file" accept="image/*" onChange={(e) => {
                   const file = e.target.files[0];
                   if (file) {
                     const reader = new FileReader();
                     reader.onload = (ev) => {
                       setFormData({...formData, avatar: ev.target.result});
                     };
                     reader.readAsDataURL(file);
                   }
                 }} className="w-full bg-white border border-gray-200 text-[#113253] font-bold rounded-xl py-2 px-3 outline-none focus:border-[#4facfe] transition-all shadow-inner text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#e2f0ef] file:text-[#489895] hover:file:bg-[#d0e6e4] cursor-pointer" />
               </div>

               <div className="pt-4 flex justify-end">
                 <button type="submit" className="bg-[#113253] text-white font-extrabold px-12 py-4 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:brightness-75 flex items-center justify-center uppercase tracking-widest text-sm">
                   Commit Changes
                 </button>
               </div>
             </form>
           )}

            {/* My Applications Section */}
            <div className="mt-12 pt-8 border-t border-gray-100">
               <h3 className="text-3xl font-black text-[#113253] mb-6">My Applications</h3>
               {appliedJobs && appliedJobs.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {appliedJobs.map((app) => (
                     <div key={app.id} className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-sm flex flex-col justify-between">
                       <div>
                         <h4 className="text-xl font-bold text-[#113253] mb-2">{app.role}</h4>
                         <p className="text-sm font-bold text-gray-400 mb-4">{app.location}</p>
                         <p className="text-xs font-semibold text-gray-600 mb-2">ATS Score: {app.ats_score}%</p>
                       </div>
                       
                       <div className="mt-4 flex items-center justify-between">
                         <span className="text-[10px] font-black tracking-widest uppercase text-gray-400">Status</span>
                         <span className={`
                           px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest relative overflow-hidden backdrop-blur-xl border
                           ${app.status === 'Shortlisted' ? 'bg-green-500/20 text-green-700 border-green-500/30 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 
                             app.status === 'Rejected' ? 'bg-red-500/20 text-red-700 border-red-500/30 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]' : 
                             'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]'}
                         `}>
                           {app.status || 'Pending'}
                         </span>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-gray-500 font-medium text-sm">You haven't applied to any global roles yet. Start exploring jobs!</p>
               )}
            </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
