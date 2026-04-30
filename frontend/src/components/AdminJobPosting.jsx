import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBuilding, FaBriefcase, FaMapMarkerAlt, FaCalendarAlt,
  FaGraduationCap, FaUserAlt, FaCloudUploadAlt, FaPaperPlane,
  FaFileAlt, FaInfoCircle
} from 'react-icons/fa';

const AdminJobPosting = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    title: '',
    qualification: '',
    description: '',
    education_level: '',
    years_experience: '',
    location: '',
    company_logo: '',
    official_notification: ''
  });
  const [endDateDay, setEndDateDay] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { user, token } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { blink: true, blinkId: Date.now(), redirectMessage: 'Please Login or Register to access Post a Job.' } });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (user && user.role === 'main_admin') {
      alert("As the Main Administrator, you cannot access this feature. Access denied.");
      return;
    }

    if (endDateDay < today) {
      setFormError('Date must be today or in the future.');
      return;
    }

    if (!formData.title || !formData.qualification || !formData.description || !endDateDay || !formData.education_level || !formData.years_experience || !formData.location) {
      setFormError('Please fill all mandatory fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        end_date: `${endDateDay} 11:59 PM`
      };

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setStatus('success');
        addNotification("Job published successfully!", "success");
        setFormData({ company_name: '', title: '', qualification: '', description: '', education_level: '', years_experience: '', location: '', company_logo: '', official_notification: '' });
        setEndDateDay('');
      } else {
        setStatus('error');
        addNotification("Failed to publish job.", "error");
      }
    } catch (err) {
      setStatus('error');
      addNotification("Network error while publishing job.", "error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  if (!user) return null;

  // Modern Styled Classes
  const cardStyle = "bg-gradient-to-br from-cyan-100/80 via-teal-100/70 to-emerald-50/80 backdrop-blur-3xl border border-teal-200/60 rounded-[40px] shadow-[0_25px_50px_-12px_rgba(0,128,128,0.2)] overflow-hidden";
  const inputWrapper = "relative group";
  const labelStyle = "flex items-center gap-2 text-[12px] font-black text-[#1a3a34]/80 mb-2 uppercase tracking-widest ml-2";
  const inputStyle = "w-full bg-white/40 border-2 border-teal-200/50 rounded-2xl py-4 px-5 focus:border-teal-400 focus:bg-white/70 outline-none transition-all duration-300 font-bold text-gray-800 shadow-sm group-hover:shadow-md pr-12 backdrop-blur-sm";
  const iconStyle = "absolute right-5 top-[48px] text-teal-500 group-focus-within:text-teal-700 transition-colors duration-300 text-lg";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0fbfc] via-[#e6f7f2] to-[#dff6f0] py-16 px-4 flex flex-col items-center font-sans relative overflow-hidden">

      {/* Soft Floating Bubbles / Water Drops */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-cyan-300/30 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-teal-300/30 rounded-full blur-[120px]"></div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 opacity-10 rotate-12 transition-transform hover:scale-110"><FaLeaf size={100} className="text-teal-900" /></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center relative z-10">
        <h2 className="text-5xl md:text-6xl font-black text-[#1a3a34] tracking-tight mb-4">
          Launch a <span className="text-teal-600">Career</span>
        </h2>
        <div className="flex items-center justify-center gap-2 text-teal-800/50 font-black uppercase tracking-[0.4em] text-[10px]">
          <div className="h-[2px] w-8 bg-teal-300"></div>
          Professional Job Portal
          <div className="h-[2px] w-8 bg-teal-300"></div>
        </div>
      </motion.div>

      <div className="w-full max-w-5xl relative z-10">
        <div className={cardStyle}>
          {/* Header Section */}
          <div className="bg-gradient-to-r from-cyan-500/20 to-teal-500/20 p-8 border-b border-teal-200/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm text-emerald-600"><FaBriefcase size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-[#1a3a34] uppercase tracking-wider">Job Details</h3>
                <p className="text-emerald-700/50 text-xs font-bold">Fill everything to reach the best candidates</p>
              </div>
            </div>
            <div className="hidden md:block bg-emerald-100/50 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-black border border-emerald-200 uppercase tracking-widest">
              Admin Access
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-14">
            <AnimatePresence>
              {formError && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-10 flex items-center gap-3 overflow-hidden">
                  <FaInfoCircle /> <span className="text-sm font-bold">{formError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">

              {/* Company & Qualification */}
              <div className={inputWrapper}>
                <label className={labelStyle}>Company Name <span className="text-emerald-400">*</span></label>
                <input type="text" required className={inputStyle} placeholder="Hire-X Solutions" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} />
                <FaBuilding className={iconStyle} />
              </div>

              <div className={inputWrapper}>
                <label className={labelStyle}>General Qualification <span className="text-emerald-400">*</span></label>
                <input type="text" required className={inputStyle} placeholder="B.E, BCA, MCA" value={formData.qualification} onChange={e => setFormData({ ...formData, qualification: e.target.value })} />
                <FaGraduationCap className={iconStyle} />
              </div>

              {/* Title & Experience */}
              <div className={inputWrapper}>
                <label className={labelStyle}>Job Title <span className="text-emerald-400">*</span></label>
                <input type="text" required className={inputStyle} placeholder="Full Stack Developer" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                <FaBriefcase className={iconStyle} />
              </div>

              <div className={inputWrapper}>
                <label className={labelStyle}>Experience Level <span className="text-emerald-400">*</span></label>
                <input type="text" required className={inputStyle} placeholder="Fresher / 2+ Years" value={formData.years_experience} onChange={e => setFormData({ ...formData, years_experience: e.target.value })} />
                <FaUserAlt className={iconStyle} />
              </div>

              {/* Location & End Date */}
              <div className={inputWrapper}>
                <label className={labelStyle}>Work Location <span className="text-emerald-400">*</span></label>
                <input type="text" required className={inputStyle} placeholder="Bengaluru, KA" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                <FaMapMarkerAlt className={iconStyle} />
              </div>

              <div className={inputWrapper}>
                <label className={labelStyle}>Last Date to Apply <span className="text-emerald-400">*</span></label>
                <input type="date" min={today} required className={inputStyle} value={endDateDay} onChange={e => setEndDateDay(e.target.value)} />
                <FaCalendarAlt className={iconStyle} />
              </div>

              {/* Uploader Section - Glass Style */}
              <div className="space-y-2">
                <label className={labelStyle}>Company Logo <span className="text-gray-400 font-medium">(Image only - Max 2MB)</span></label>
                <div className="relative border-2 border-dashed border-emerald-100 rounded-2xl p-4 flex items-center justify-between bg-emerald-50/20 hover:bg-white transition-all cursor-pointer">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        alert("Image size exceeds 2MB limit. Please upload a smaller image.");
                        e.target.value = '';
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, company_logo: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }} />
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-600"><FaCloudUploadAlt /></div>
                    <span className="text-[12px] font-bold text-[#1a3a34]/60 uppercase tracking-tighter">Upload Logo</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 truncate max-w-[100px]">{formData.company_logo ? "UPLOADED" : "CHOOSE"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelStyle}>Official Notification <span className="text-gray-400 font-medium">(Optional - PDF Only - Max 5MB)</span></label>
                <div className="relative border-2 border-dashed border-emerald-100 rounded-2xl p-4 flex items-center justify-between bg-emerald-50/20 hover:bg-white transition-all cursor-pointer">
                  <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        alert("File size exceeds 5MB limit. Please upload a smaller PDF.");
                        e.target.value = '';
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, official_notification: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }} />
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-600"><FaFileAlt /></div>
                    <span className="text-[12px] font-bold text-[#1a3a34]/60 uppercase tracking-tighter">Upload PDF Only</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 truncate max-w-[100px]">{formData.official_notification ? "UPLOADED" : "CHOOSE"}</span>
                </div>
              </div>

              {/* Education Level */}
              <div className="md:col-span-1">
                <label className={labelStyle}>Education Level <span className="text-emerald-400">*</span></label>
                <select required value={formData.education_level} onChange={e => setFormData({ ...formData, education_level: e.target.value })} className={`${inputStyle} appearance-none cursor-pointer`}>
                  <option value="">Choose Level</option>
                  <option value="High School / 10th / 12th">High School / 10th / 12th</option>
                  <option value="Diploma">Diploma</option>
                  <option value="B.Tech / B.E">B.Tech / B.E</option>
                  <option value="B.Sc / BCA">B.Sc / BCA</option>
                  <option value="B.Com / BBA">B.Com / BBA</option>
                  <option value="BA">BA</option>
                  <option value="Master's Degree (M.Tech / ME)">Master's Degree (M.Tech / ME)</option>
                  <option value="Master's Degree (MCA / M.Sc)">Master's Degree (MCA / M.Sc)</option>
                  <option value="Master's Degree (MBA / M.Com / MA)">Master's Degree (MBA / M.Com / MA)</option>
                  <option value="Ph.D / Doctorate">Ph.D / Doctorate</option>
                  <option value="Any Graduate">Any Graduate</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className={labelStyle}>Detailed Description <span className="text-teal-400">*</span></label>
                <textarea rows={5} required className="w-full bg-white/40 border-2 border-teal-200/50 rounded-[30px] py-6 px-8 focus:border-teal-400 focus:bg-white/70 outline-none transition-all font-bold text-gray-800 shadow-sm resize-none backdrop-blur-sm" placeholder="Explain the role, salary, and requirements..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
            </div>

            {/* Submit */}
            <div className="mt-16 flex flex-col items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.2)" }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSubmitting}
                className="bg-[#10b981] hover:bg-[#059669] text-white font-black py-6 px-20 rounded-[28px] shadow-2xl flex items-center gap-4 tracking-[0.3em] uppercase text-sm transition-all"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Job'}
                <FaPaperPlane className="text-xs" />
              </motion.button>
              <p className="text-[10px] font-bold text-emerald-800/30 uppercase tracking-widest italic">All details are encrypted and safe</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Simple Leaf Component for background
const FaLeaf = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
  </svg>
);

export default AdminJobPosting;