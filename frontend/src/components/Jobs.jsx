import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzingMap, setAnalyzingMap] = useState({});
  const [applying, setApplying] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [cvBase64, setCvBase64] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [suggestionMsg, setSuggestionMsg] = useState('');
  const [finalSubmitSuccess, setFinalSubmitSuccess] = useState(false);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [viewDocModal, setViewDocModal] = useState(null);
  const locationFragment = useLocation().search; // ?category=Web
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const formatUIStandardDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      let dStr = dateStr.toString().split(' ')[0]; // Extract just the YYYY-MM-DD part if possible
      if (dStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [y, m, d] = dStr.split('-');
        return `${d}-${m}-${y} 11:59 PM`;
      }
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year} 11:59 PM`;
    } catch (e) {
      return dateStr;
    }
  };

  useEffect(() => {
    setLoading(true);
    let url = `/api/jobs${locationFragment}`;
    
    const params = new URLSearchParams(locationFragment);
    const title = params.get('title') || params.get('category');
    const loc = params.get('location');

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setJobs(data);
          setSuggestionMsg('');
          setLoading(false);
        } else {
          // If no matches for both, try fetching without location if both were provided,
          // or just show empty if no fallback needed.
          if (loc && title) {
            fetch(`/api/jobs?title=${title}`)
              .then(res2 => res2.json())
              .then(data2 => {
                  if (Array.isArray(data2) && data2.length > 0) {
                    setJobs(data2);
                    setSuggestionMsg(`These jobs are not available in ${loc}, but are available in other locations.`);
                 } else {
                    setJobs([]);
                    setSuggestionMsg('');
                 }
                 setLoading(false);
              })
              .catch(() => { setJobs([]); setLoading(false); });
          } else {
            setJobs([]);
            setSuggestionMsg('');
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        setJobs([]);
        setLoading(false);
      });
  }, [locationFragment]);

  const handleApplyClick = (job) => {
    if (user && user.role === 'main_admin') {
      alert("As the Main Administrator, you cannot access this feature. Access denied.");
      return;
    }
    if (!user) {
      navigate('/login', { state: { isRegister: true } });
      return;
    }
    setSelectedJob(job);
    setCvFile(null);
    setCvBase64(null);
    setAnalysisResult(null);
    setFinalSubmitSuccess(false);
  };

  const analyzeCV = async () => {
    if (!cvFile) {
      alert("Please upload your PDF CV document. It is compulsory.");
      return;
    }
    setApplying(true);
    
    // Convert to base64
    const reader = new FileReader();
    reader.readAsDataURL(cvFile);
    reader.onload = async () => {
      try {
        const base64Data = reader.result.split(',')[1];
        setCvBase64(reader.result);
        
        // 1. Analyze Document CV
        const analyzeRes = await fetch('/api/cv-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ cv_pdf_base64: base64Data, job_description: selectedJob.description, profile_name: user?.name, mimeType: cvFile.type || 'application/pdf' })
        });
        
        if (!analyzeRes.ok) {
           throw new Error("Server or Network error while analyzing.");
        }
        
        const aiData = await analyzeRes.json();
        setAnalysisResult(aiData);
      } catch (err) {
        console.error(err);
        alert("System error processing your document. Please verify it is a valid PDF/TXT file and under 20MB.");
      }
      setApplying(false);
    };
  };

  const finalSubmit = async () => {
    setSubmittingApp(true);
    try {
      const appRes = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          job_id: selectedJob.id, 
          cv_url: cvBase64 || cvFile.name, 
          ats_score: analysisResult.ats_score, 
          cv_analysis: analysisResult.analysis 
        })
      });
      const resultData = await appRes.json();
      if (appRes.ok) {
        setFinalSubmitSuccess(true);
      } else {
        alert(resultData.error || "Failed to apply");
      }
    } catch(err) {
      alert("Network error processing final submission.");
    }
    setSubmittingApp(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#EEE8AA] flex flex-col"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow w-full">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-extrabold text-[#113253]">All Job Opportunities</h2>
        <p className="text-gray-600 mt-3">Browse all exclusive roles spanning multiple categories globally.</p>
      </div>
      
      {loading ? (
        <div className="text-center py-20 text-gray-500 font-bold">Loading remote jobs...</div>
      ) : (
        <>
        {suggestionMsg && (
          <div className="bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400 p-4 mb-8 text-center font-bold rounded shadow-sm">
            {suggestionMsg}
          </div>
        )}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {jobs.length > 0 ? jobs.map((job, idx) => (
            <motion.div 
              key={job.id} 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg flex flex-col group transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start gap-4 mb-3">
                {job.company_logo && typeof job.company_logo === 'string' && job.company_logo.startsWith('data:image') && (
                  <img src={job.company_logo} alt="Logo" className="w-14 h-14 rounded-lg object-contain bg-gray-50 border border-gray-100 p-1 flex-shrink-0" />
                )}
                <div>
                   <h4 className="text-2xl font-extrabold text-[#113253] mb-1 group-hover:text-[#489895] transition-colors">{job.title}</h4>
                   <p className="text-sm font-black text-gray-500 uppercase tracking-widest">{job.company_name || 'Unknown Company'}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                 <p className="text-sm bg-gray-100 text-[#113253] font-bold px-3 py-1 inline-block rounded w-max">{job.qualification}</p>
                 {job.official_notification && (
                   <button onClick={() => setViewDocModal(job.official_notification)} className="text-[#489895] hover:text-[#113253] font-bold text-xs flex items-center gap-1 transition-colors">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                     View Notification
                   </button>
                 )}
              </div>
              <p className="text-gray-500 line-clamp-3 leading-relaxed mb-6 flex-grow">{job.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {job.location && <span className="bg-[#e2f0ef] text-[#489895] text-xs font-bold px-2 py-1 rounded">📍 {job.location}</span>}
                {job.years_experience && <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">⏳ {job.years_experience} Exp</span>}
                {job.end_date && <span className="bg-yellow-50 text-yellow-700 text-xs font-bold px-2 py-1 rounded border border-yellow-200">🗓️ {formatUIStandardDate(job.end_date)}</span>}
              </div>

              <button onClick={() => handleApplyClick(job)} className="mt-auto w-full py-4 bg-[#f8fafc] text-[#113253] font-black rounded-2xl group-hover:bg-[#113253] group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-2 group-hover:brightness-90 group-hover:shadow-[0_15px_30px_rgba(17,50,83,0.3)] uppercase tracking-widest text-[12px] shadow-sm relative z-10">
                Apply Now
              </button>
            </motion.div>
          )) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
               <p className="text-gray-500 font-bold">No jobs currently available.</p>
            </motion.div>
          )}
        </motion.div>
        </>
      )}
      {/* Apply Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto hidden-scrollbar">
              <button disabled={applying || submittingApp} onClick={() => {setSelectedJob(null); setAnalysisResult(null); setFinalSubmitSuccess(false);}} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 disabled:opacity-50">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>

              {!analysisResult ? (
                <>
                  <h3 className="text-3xl font-extrabold text-[#113253] mb-2">CV Analyzer</h3>
                  <p className="text-gray-500 font-medium mb-6">Upload your CV directly to evaluate your match for this role.</p>
                  
                  <div className="bg-[#f8fafc] p-4 rounded-xl border border-gray-100 mb-6 flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      {selectedJob.company_logo && (
                         <img src={selectedJob.company_logo} alt="Logo" className="w-12 h-12 rounded object-contain bg-white shadow-sm p-1 border border-gray-200" />
                      )}
                      <div>
                        <p className="font-bold text-[#4facfe] text-lg">{selectedJob.title}</p>
                        {selectedJob.end_date && <p className="text-xs font-bold text-gray-500">Apply by: <span className="text-red-500">{formatUIStandardDate(selectedJob.end_date)}</span></p>}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className={`relative border-2 border-dashed ${applying ? 'border-[#4facfe] shadow-[0_0_15px_rgba(79,172,254,0.5)] bg-[#f0f9ff]' : 'border-gray-300 bg-white'} rounded-2xl p-8 text-center transition-all duration-300 group`}>
                      <input 
                        type="file"
                        accept="application/pdf, text/plain"
                        onChange={(e) => setCvFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={applying}
                      />
                      <div className="flex flex-col items-center justify-center pointer-events-none">
                         {applying ? (
                             <>
                               <div className="w-16 h-16 bg-[#4facfe]/20 rounded-full flex items-center justify-center mb-4 relative">
                                  <div className="absolute inset-0 rounded-full animate-ping bg-[#4facfe]/30"></div>
                                  <svg className="w-8 h-8 text-[#4facfe] animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                               </div>
                               <h4 className="text-xl font-bold text-[#4facfe] mb-1">Analyzing Document...</h4>
                               <p className="text-sm text-[#4facfe]/70 font-medium">Extracting Skills and Experience Details</p>
                             </>
                         ) : cvFile ? (
                             <>
                               <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                               </div>
                               <h4 className="text-xl font-bold text-[#113253] mb-1">{cvFile.name}</h4>
                               <p className="text-sm text-gray-500 font-medium group-hover:text-gray-700 transition-colors">Click or drag to change file</p>
                             </>
                         ) : (
                             <>
                               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#f0f9ff] group-hover:scale-110 transition-all">
                                  <svg className="w-8 h-8 text-gray-400 group-hover:text-[#4facfe]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                               </div>
                               <h4 className="text-xl font-bold text-[#113253] mb-1">Upload CV Document</h4>
                               <p className="text-sm text-gray-500 font-medium">Drop PDF or TXT here</p>
                             </>
                         )}
                      </div>
                    </div>
                  </div>

                  {!applying && <button 
                    onClick={analyzeCV} 
                    disabled={applying} 
                    className="w-full bg-gradient-to-r from-[#4facfe] to-[#806bf8] text-white py-4 rounded-xl font-extrabold shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    Analyze Match Score
                  </button>}
                </>
              ) : !finalSubmitSuccess ? (
                <div className="py-2">
                  <h3 className="text-3xl font-black text-[#113253] mb-6 text-center border-b pb-4">Analysis Result</h3>
                  
                  {analysisResult.name_mismatch_alert === "True" && (
                    <div className="bg-red-50 text-red-600 font-bold p-4 rounded-xl border border-red-200 mb-6 shadow-sm text-center animate-pulse">
                      Alert: The name on your uploaded CV differs from your profile name. Please verify.
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-6 mb-6 items-center">
                    <div className="bg-[#f0f9ff] shrink-0 p-6 rounded-2xl border border-blue-100 flex flex-col items-center justify-center w-40 h-40 shadow-inner">
                      <p className="text-xs font-bold text-blue-600 uppercase mb-2">Match Score</p>
                      <p className={`text-5xl font-black ${analysisResult.ats_score >= 60 ? 'text-green-500' : 'text-orange-500'}`}>
                        {analysisResult.ats_score}<span className="text-2xl text-gray-400 opacity-50">/100</span>
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                        "{analysisResult.analysis}"
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                       <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                         <svg className="w-4 h-4 text-[#489895]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> Top Skills Extracted
                       </h4>
                       <div className="flex flex-wrap gap-2 mt-3">
                         {analysisResult.top_skills && analysisResult.top_skills.length > 0 ? analysisResult.top_skills.map((s, i) => (
                           <span key={i} className="text-xs font-bold bg-[#e2f0ef] text-[#489895] px-2 py-1 rounded-md">{s}</span>
                         )) : <span className="text-xs text-gray-400">No specific skills found</span>}
                       </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                       <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                         <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Experience Evaluated
                       </h4>
                       <p className="text-sm font-bold text-gray-700 mt-3">{analysisResult.experience_summary || 'Experience not clearly mentioned.'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => {
                        setSelectedJob(null);
                        setAnalysisResult(null);
                        navigate('/jobs');
                      }}
                      className="flex-1 bg-white border-2 border-[#113253] text-[#113253] py-4 rounded-xl font-extrabold shadow hover:bg-gray-50 transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-sm"
                    >
                      Improve CV (Explore Jobs)
                    </button>
                    <button 
                      onClick={finalSubmit}
                      disabled={submittingApp}
                      className="flex-1 bg-[#113253] text-white py-4 rounded-xl font-extrabold shadow-lg hover:bg-[#1a4a7a] transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {submittingApp ? 'Submitting...' : 'Proceed to Apply'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
                    <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <h3 className="text-3xl font-black text-[#113253] mb-2">Application Successful!</h3>
                  <p className="text-gray-500 font-medium mb-6">Your profile and analyzed CV have been submitted to the employer.</p>
                  
                  {analysisResult.suggested_roles && analysisResult.suggested_roles.length > 0 && (
                    <div className="text-left mt-4 border-t border-gray-100 pt-6">
                      <h4 className="text-lg font-extrabold text-[#113253] mb-3">Other Roles Matching Your CV:</h4>
                      <div className="flex flex-wrap gap-2">
                         {analysisResult.suggested_roles.map((srole, i) => (
                           <span key={i} className="bg-gray-100 text-[#489895] px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">{srole}</span>
                         ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-4 font-medium italic">Explore these roles in our Jobs section for better chances!</p>
                    </div>
                  )}

                  <button onClick={() => { setSelectedJob(null); setAnalysisResult(null); setFinalSubmitSuccess(false); }} className="mt-8 w-full py-4 border-2 border-[#113253] text-[#113253] font-extrabold rounded-xl hover:bg-[#113253] hover:text-white transition-all uppercase tracking-wider text-sm">
                    Back to Jobs
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Doc Modal */}
      {viewDocModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300 ease-in-out p-4" onClick={() => setViewDocModal(null)}>
           <div className="relative max-w-4xl max-h-[90vh] w-full h-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="bg-[#113253] p-4 flex justify-between items-center shadow-md z-10 relative">
                 <h3 className="text-white font-extrabold text-lg tracking-widest uppercase flex items-center gap-2">
                   <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                   Official Notification Viewer
                 </h3>
                 <button onClick={() => setViewDocModal(null)} className="text-white/70 hover:text-red-400 transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                 </button>
              </div>
              
              <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-4">
                {String(viewDocModal).startsWith('data:application/pdf') ? (
                  <iframe src={viewDocModal} className="w-full h-full rounded-xl border border-gray-200 shadow-inner" title="Notification PDF Viewer" />
                ) : String(viewDocModal).startsWith('data:image') ? (
                  <img src={viewDocModal} className="max-w-full max-h-full object-contain rounded-xl shadow-lg border border-gray-200" alt="Notification" />
                ) : (
                  <div className="text-center p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="font-bold text-[#113253]">Unsupported Document Format</p>
                    <p className="text-sm text-gray-500 mt-2">The employer uploaded a notification format that cannot be previewed. Only PDF and Images are supported.</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default Jobs;
