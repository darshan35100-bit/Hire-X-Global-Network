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

        if (aiData.mismatch_alert && aiData.mismatch_alert.length > 5) {
          // Alert is shown inside the UI now
        }

        setAnalysisResult(aiData);
      } catch (err) {
        console.error(err);
        alert("System error processing your document. Please verify it is a valid PDF/TXT file and under 2MB.");
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
    } catch (err) {
      alert("Network error processing final submission.");
    }
    setSubmittingApp(false);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-[#a7f3d0] via-[#6ee7b7] to-[#34d399] font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-white/20 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-150px] right-[-150px] w-[600px] h-[600px] bg-[#10b981]/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Abstract wave patterns for the background as seen in the photo */}
      <svg className="absolute bottom-0 right-0 opacity-20 pointer-events-none" width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="#059669" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.1,-46.2C90.4,-33.3,95.9,-17.6,94.9,-2.4C93.9,12.8,86.4,27.5,75.9,39.6C65.4,51.7,51.9,61.1,37.3,67.6C22.7,74.1,7,77.7,-8.4,78.2C-23.8,78.7,-38.9,76.1,-52.1,69.1C-65.3,62.1,-76.6,50.7,-84.1,36.7C-91.6,22.7,-95.3,6.1,-93,-9.6C-90.7,-25.3,-82.4,-40.1,-70.5,-51C-58.6,-61.9,-43,-68.9,-28.5,-74.6C-14,-80.3,1.4,-84.7,15.8,-83.1C30.2,-81.5,43.6,-73.9,44.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
      </svg>
      <svg className="absolute top-10 left-0 opacity-10 pointer-events-none" width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="#047857" d="M38.1,-62.4C49.9,-53.8,60.3,-43.3,68.7,-30.5C77.1,-17.7,83.5,-2.6,80.7,11.3C77.9,25.2,65.9,37.9,53,47.4C40.1,56.9,26.3,63.2,11.4,66.1C-3.5,69,-19.5,68.5,-32.8,61.7C-46.1,54.9,-56.7,41.8,-63.9,27C-71.1,12.2,-74.9,-4.3,-71.4,-19.3C-67.9,-34.3,-57.1,-47.8,-43.9,-56C-30.7,-64.2,-15.4,-67.1,-0.5,-66.3C14.4,-65.5,28.8,-61,38.1,-62.4Z" transform="translate(100 100)" />
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full flex-grow z-10">

        <div className="mb-12 text-center">
          <h2 className="text-4xl font-extrabold text-[#064e3b] mb-3 drop-shadow-sm tracking-tight">
            All Job Opportunities
          </h2>
          <p className="text-[#047857] font-medium text-sm sm:text-base max-w-2xl mx-auto">Browse all exclusive roles spanning multiple categories globally.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#064e3b] font-bold animate-pulse text-lg">Loading opportunities...</div>
        ) : (
          <>
            {suggestionMsg && (
              <div className="bg-yellow-50/90 text-yellow-800 border-l-4 border-yellow-400 p-4 mb-8 text-center font-bold rounded shadow-sm backdrop-blur-sm">
                {suggestionMsg}
              </div>
            )}

            <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {jobs.length > 0 ? jobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[24px] p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] transition-all hover:-translate-y-1 flex flex-col h-full"
                >
                  <div className="flex items-start gap-3 mb-4">
                    {job.company_logo && typeof job.company_logo === 'string' && job.company_logo.startsWith('data:image') ? (
                      <img src={job.company_logo} alt="Logo" className="w-10 h-10 rounded shadow-sm object-cover bg-white p-[2px] flex-shrink-0 border border-white/50" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-white/50 flex items-center justify-center text-teal-800 font-bold text-lg shadow-sm border border-white/50 flex-shrink-0">
                        {job.company_name ? job.company_name.charAt(0) : 'C'}
                      </div>
                    )}
                    <div>
                      <h4 className="text-[18px] font-black text-[#0f2e26] leading-tight">{job.title}</h4>
                      <p className="text-[11px] font-black text-gray-600 uppercase tracking-widest mt-1">{job.company_name}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    {job.qualification ? (
                      <span className="bg-white/60 text-[#0f766e] text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm border border-white/60">
                        {job.qualification}
                      </span>
                    ) : (
                      <span className="bg-white/60 text-[#0f766e] text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm border border-white/60">
                        Degree
                      </span>
                    )}

                    {job.official_notification && (
                      <button onClick={() => {
                        if (!user) {
                          navigate('/login', { state: { blink: true, blinkId: Date.now(), redirectMessage: 'Please Login or Register to view notifications.' } });
                        } else {
                          setViewDocModal(job.official_notification);
                        }
                      }} className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-900 transition-colors bg-white/70 hover:bg-white px-2 py-1.5 rounded-md shadow-sm border border-emerald-100 cursor-pointer">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        View Notification
                      </button>
                    )}
                  </div>

                  <p className="text-[13px] text-gray-700 mb-5 line-clamp-3 leading-relaxed flex-grow font-medium">{job.description}</p>

                  <div className="flex gap-2 mb-3 flex-wrap">
                    {job.location && (
                      <span className="bg-white/60 text-[#0f766e] text-[11px] font-bold px-2.5 py-1 rounded shadow-sm border border-white/60 flex items-center gap-1">
                        📍 {job.location}
                      </span>
                    )}
                    {job.years_experience && (
                      <span className="bg-white/60 text-[#0f766e] text-[11px] font-bold px-2.5 py-1 rounded shadow-sm border border-white/60 flex items-center gap-1">
                        ⏳ {job.years_experience} Exp
                      </span>
                    )}
                  </div>

                  {job.end_date && (
                    <div className="mb-4">
                      <span className="bg-white/60 text-[#0f766e] text-[11px] font-bold px-2.5 py-1 rounded shadow-sm border border-white/60 inline-flex items-center gap-1">
                        📅 {formatUIStandardDate(job.end_date)}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => handleApplyClick(job)}
                    className="w-full mt-auto py-3 rounded-xl bg-gradient-to-r from-[#34d399] to-[#059669] text-white font-black shadow-lg hover:shadow-xl hover:from-[#10b981] hover:to-[#047857] transition-all duration-300 active:scale-95 uppercase tracking-widest text-[11px] border border-white/30"
                  >
                    Apply Now
                  </button>
                </motion.div>
              )) : (
                <div className="col-span-full text-center py-20 bg-white/40 backdrop-blur rounded-[24px] border border-white/60 shadow-sm">
                  <p className="text-[#064e3b] font-bold text-lg">No jobs currently available.</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
              <button disabled={applying || submittingApp} onClick={() => { setSelectedJob(null); setAnalysisResult(null); setFinalSubmitSuccess(false); }} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="mb-8">
                <h3 className="text-3xl font-black text-gray-900 mb-2">Apply for {selectedJob.title}</h3>
                <p className="text-gray-500 font-medium">{selectedJob.company_name}</p>
              </div>

              {!analysisResult ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 border-2 border-dashed border-emerald-300 rounded-[24px] p-8 text-center hover:bg-emerald-50/30 transition-colors shadow-inner">
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.type !== 'application/pdf') {
                              alert("Please upload a valid PDF document only. Only PDF is accepted.");
                              e.target.value = null;
                              return;
                            }
                            if (file.size > 2 * 1024 * 1024) {
                              alert("File size must be below 2 MB.");
                              e.target.value = null;
                              return;
                            }
                            setCvFile(file);
                          }
                        }}
                        className="hidden"
                      />
                      <div className="text-center mb-6">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500 rounded-full flex items-center justify-center p-[3px] shadow-[0_0_20px_rgba(236,72,153,0.5)] animate-[pulse_3s_infinite]">
                          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                            <span className="text-4xl bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent font-black">+</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-800 font-bold mb-1 text-lg">Click to Upload CV</p>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">PDF format only (Max 2MB)</p>
                    </label>
                    {cvFile && (
                      <div className="mt-6 p-4 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center justify-between shadow-sm">
                        <span className="font-bold text-emerald-900 text-sm truncate pr-4">{cvFile.name}</span>
                        <button onClick={() => setCvFile(null)} className="text-red-500 hover:text-red-700 font-black text-xs uppercase tracking-widest transition-colors">Remove</button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={analyzeCV}
                    disabled={!cvFile || applying}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] text-sm"
                  >
                    {applying ? 'Evaluating Profile...' : 'Analyze & Proceed'}
                  </button>
                </div>
              ) : !finalSubmitSuccess ? (
                <div className="space-y-6 animate-fadeIn">
                  <div className={`p-6 rounded-3xl border ${analysisResult.ats_score === 0 ? 'bg-red-50 border-red-300 shadow-sm' : 'bg-gray-50 border-gray-200 shadow-inner'}`}>
                    <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-5">
                      <h4 className="text-xl font-black text-gray-800 tracking-tight">Profile Match Score</h4>
                      <div className={`text-5xl font-black drop-shadow-sm ${analysisResult.ats_score > 75 ? 'text-green-500' : analysisResult.ats_score > 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {analysisResult.ats_score}<span className="text-2xl">%</span>
                      </div>
                    </div>

                    {analysisResult.ats_score === 0 && (
                      <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded mb-6 shadow-sm">
                        <p className="text-red-900 font-bold text-sm flex items-center gap-2">
                          <span className="text-lg">🛑</span>
                          <span>Warning: This document does not appear to be a valid CV for this job. However, you can still proceed to apply.</span>
                        </p>
                      </div>
                    )}

                    {analysisResult.mismatch_alert && analysisResult.mismatch_alert.trim() !== "" && (
                      <div className="bg-orange-50 border-l-4 border-orange-500 p-5 rounded-r-xl mb-6 shadow-sm">
                        <p className="text-orange-900 font-bold text-sm flex items-start gap-3">
                          <span className="text-xl">⚠️</span>
                          <span className="leading-relaxed">{analysisResult.mismatch_alert}</span>
                        </p>
                      </div>
                    )}

                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 pl-1">Comprehensive Analysis</p>
                        <p className="text-[13px] font-medium text-gray-700 bg-white p-5 rounded-2xl shadow-sm leading-relaxed border border-gray-100 whitespace-pre-wrap">{analysisResult.analysis}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 pl-1">Top Skills Extracted</p>
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.top_skills?.map((s, i) => (
                              <span key={i} className="bg-white border border-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded shadow-sm">{s}</span>
                            ))}
                            {(!analysisResult.top_skills || analysisResult.top_skills.length === 0) && (
                              <span className="text-xs font-bold text-gray-500 italic bg-white p-2 rounded border border-dashed">No exact skills extracted.</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 pl-1">Experience Evaluated</p>
                          <p className="text-[13px] font-bold text-gray-800 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 leading-relaxed">{analysisResult.experience_summary}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => {
                        setSelectedJob(null);
                        setAnalysisResult(null);
                      }}
                      className="flex-1 py-4 bg-white border-2 border-emerald-500 text-emerald-700 font-black rounded-xl hover:bg-emerald-50 transition-all shadow-sm uppercase tracking-widest text-xs"
                    >
                      Improve CV
                    </button>
                    <button
                      onClick={finalSubmit}
                      disabled={submittingApp}
                      className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black rounded-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                    >
                      {submittingApp ? 'Submitting...' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
                    <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
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
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Document Viewer
              </h3>
              <div className="flex items-center gap-2">
                <a href={viewDocModal} download="Document" className="text-white hover:text-[#489895] transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur font-bold text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download
                </a>
                <button onClick={() => setViewDocModal(null)} className="text-white/70 hover:text-red-400 transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-4">
              {String(viewDocModal).startsWith('data:application/pdf') || String(viewDocModal).startsWith('data:text/') ? (
                <iframe src={viewDocModal} className="w-full h-full rounded-xl border border-gray-200 shadow-inner bg-white" title="Document Viewer" />
              ) : String(viewDocModal).startsWith('data:image') ? (
                <img src={viewDocModal} className="max-w-full max-h-full object-contain rounded-xl shadow-lg border border-gray-200" alt="Document" />
              ) : (
                <div className="text-center p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="font-bold text-[#113253]">Preview Unavailable for this Format</p>
                  <p className="text-sm text-gray-500 mt-2">Please click the Download button above to read the document (Word/Excel/etc) on your device.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Jobs;