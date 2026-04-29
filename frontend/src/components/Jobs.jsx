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
  const locationFragment = useLocation().search;
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const formatUIStandardDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      let dStr = dateStr.toString().split(' ')[0];
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

    const reader = new FileReader();
    reader.readAsDataURL(cvFile);
    reader.onload = async () => {
      try {
        const base64Data = reader.result.split(',')[1];
        setCvBase64(reader.result);

        const analyzeRes = await fetch('/api/cv-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            cv_pdf_base64: base64Data,
            job_description: selectedJob.description,
            profile_name: user?.name,
            mimeType: cvFile.type || 'application/pdf'
          })
        });

        if (!analyzeRes.ok) throw new Error();
        const aiData = await analyzeRes.json();
        setAnalysisResult(aiData);
      } catch {
        alert("Error processing document.");
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
    } catch {
      alert("Network error processing final submission.");
    }
    setSubmittingApp(false);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col overflow-hidden">

      {/* background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgb(200,255,240)] via-[rgb(180,220,255)] to-[rgb(255,220,220)]"></div>
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(0,255,200,0.35),transparent_70%)] blur-3xl"></div>
      <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(255,100,120,0.25),transparent_70%)] blur-3xl"></div>
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(0,150,255,0.25),transparent_70%)] blur-2xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 py-16 w-full">

        <div className="mb-10 text-center">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
            All Job Opportunities
          </h2>
          <p className="text-gray-600 mt-3">Browse all exclusive roles spanning multiple categories globally.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-600 font-bold">Loading remote jobs...</div>
        ) : (
          <>
            {suggestionMsg && (
              <div className="bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400 p-4 mb-8 text-center font-bold rounded shadow-sm">
                {suggestionMsg}
              </div>
            )}

            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobs.length > 0 ? jobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {job.company_logo && typeof job.company_logo === 'string' && job.company_logo.startsWith('data:image') && (
                      <img src={job.company_logo} alt="Logo" className="w-12 h-12 rounded-lg object-contain bg-white shadow-sm border border-gray-100 p-1 flex-shrink-0" />
                    )}
                    <div>
                      <h4 className="text-xl font-bold text-gray-800 leading-tight">{job.title}</h4>
                      <p className="text-xs font-black text-gray-500 uppercase tracking-widest mt-1">{job.company_name}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{job.description}</p>

                  <div className="flex gap-2 mb-4 flex-wrap">
                    {job.location && <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full font-bold">{job.location}</span>}
                    {job.years_experience && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">{job.years_experience} Exp</span>}
                    {job.end_date && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">Last Date: {formatUIStandardDate(job.end_date).split(' ')[0]}</span>}
                  </div>

                  {job.official_notification && (
                    <div className="mb-4">
                      <a href={job.official_notification} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:text-blue-800 underline uppercase tracking-widest">
                        View Official Notification
                      </a>
                    </div>
                  )}

                  <button
                    onClick={() => handleApplyClick(job)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 text-white font-bold shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95"
                  >
                    Apply Now
                  </button>
                </motion.div>
              )) : (
                <div className="col-span-full text-center py-20 bg-white/40 backdrop-blur rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-600 font-bold">No jobs currently available.</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>

      {/* Dynamic Apply Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedJob(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>

              {!finalSubmitSuccess ? (
                <>
                  <h3 className="text-2xl font-black text-gray-800 mb-2">Apply for {selectedJob.title}</h3>
                  <p className="text-gray-600 mb-6 font-medium text-sm">at {selectedJob.company_name}</p>

                  {!analysisResult ? (
                    <div className="space-y-6">
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-100 transition-colors">
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
                                if (file.size > 20 * 1024 * 1024) {
                                  alert("File size must be below 20 MB.");
                                  e.target.value = null;
                                  return;
                                }
                                setCvFile(file);
                              }
                            }}
                            className="hidden"
                          />
                          <div className="text-4xl mb-3">📄</div>
                          <p className="text-gray-700 font-bold mb-1">Click to Upload CV (PDF)</p>
                          <p className="text-xs text-gray-500">Max size 20MB. PDF only.</p>
                        </label>
                        {cvFile && (
                          <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
                            <span className="font-bold text-teal-800 text-sm truncate">{cvFile.name}</span>
                            <button onClick={() => setCvFile(null)} className="text-red-500 font-bold text-xs">Remove</button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={analyzeCV}
                        disabled={!cvFile || applying}
                        className="w-full py-4 bg-gradient-to-r from-[#113253] to-[#489895] text-white font-extrabold rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                      >
                        {applying ? 'Analyzing Profile using AI...' : 'Analyze & Proceed'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-fadeIn">
                      <div className={`p-6 rounded-2xl border ${analysisResult.is_valid_cv === false ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                        {analysisResult.is_valid_cv === false ? (
                          <div className="text-center">
                            <div className="text-4xl mb-2">⚠️</div>
                            <h4 className="text-xl font-black text-red-600 mb-2">Invalid Document Detected</h4>
                            <p className="text-red-800 font-medium text-sm mb-4">{analysisResult.analysis}</p>
                            <button onClick={() => setAnalysisResult(null)} className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl text-sm transition-transform hover:scale-105 shadow-sm">Upload Valid CV</button>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                              <h4 className="text-xl font-black text-gray-800">AI Profile Match</h4>
                              <div className={`text-4xl font-black ${analysisResult.ats_score > 75 ? 'text-green-500' : analysisResult.ats_score > 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                                {analysisResult.ats_score}%
                              </div>
                            </div>
                            
                            {analysisResult.mismatch_alert && analysisResult.mismatch_alert.trim() !== "" && (
                              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md mb-6 shadow-sm">
                                <p className="text-yellow-800 font-bold text-sm flex items-start gap-2">
                                  <span className="text-lg">⚠️</span> 
                                  <span>{analysisResult.mismatch_alert}</span>
                                </p>
                              </div>
                            )}

                            <div className="space-y-5">
                              <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Detailed Analysis</p>
                                <p className="text-sm font-medium text-gray-700 bg-white p-4 rounded-xl shadow-sm leading-relaxed border border-gray-100 whitespace-pre-wrap">{analysisResult.analysis}</p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Top Skills Extracted</p>
                                  <div className="flex flex-wrap gap-2">
                                    {analysisResult.top_skills?.map((s, i) => (
                                      <span key={i} className="bg-white border border-gray-200 text-xs font-bold px-2 py-1 rounded shadow-sm text-gray-800">{s}</span>
                                    ))}
                                    {(!analysisResult.top_skills || analysisResult.top_skills.length === 0) && (
                                      <span className="text-xs font-bold text-gray-500 italic">No exact skills extracted.</span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Experience Evaluated</p>
                                  <p className="text-sm font-bold text-gray-800 bg-white p-3 rounded-xl shadow-sm border border-gray-100">{analysisResult.experience_summary}</p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {analysisResult.is_valid_cv !== false && (
                        <button
                          onClick={finalSubmit}
                          disabled={submittingApp}
                          className="w-full py-4 bg-gradient-to-r from-teal-500 to-green-500 text-white font-extrabold rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                        >
                          {submittingApp ? 'Submitting Application...' : 'Submit Application Now'}
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-10 animate-fadeIn">
                  <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner">✓</div>
                  <h3 className="text-3xl font-black text-gray-800 mb-2">Application Sent!</h3>
                  <p className="text-gray-600 mb-8 font-medium">Your profile has been shared with {selectedJob.company_name}. Good luck!</p>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg"
                  >
                    Back to Jobs
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Jobs;