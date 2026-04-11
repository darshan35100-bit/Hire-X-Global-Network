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
  const [analysisResult, setAnalysisResult] = useState(null);
  const locationFragment = useLocation().search; // ?category=Web
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    let url = `/api/jobs${locationFragment}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setJobs(data);
        else setJobs([]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [locationFragment]);

  const handleApplyClick = (job) => {
    if (!user) {
      navigate('/login', { state: { isRegister: true } });
      return;
    }
    setSelectedJob(job);
    setCvFile(null);
    setAnalysisResult(null);
  };

  const processApplication = async () => {
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
        
        // 1. Analyze PDF CV
        const analyzeRes = await fetch('/api/cv-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ cv_pdf_base64: base64Data, job_description: selectedJob.description })
        });
        const aiData = await analyzeRes.json();
        
        // 2. Submit Application
        const appRes = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ 
            job_id: selectedJob.id, 
            cv_url: cvFile.name, 
            ats_score: aiData.ats_score, 
            cv_analysis: aiData.analysis 
          })
        });
        const resultData = await appRes.json();
        
        if (appRes.ok) {
          setAnalysisResult(aiData);
        } else {
          alert(resultData.error || "Failed to apply");
          setSelectedJob(null);
        }
      } catch (err) {
        alert("Network error processing application.");
        setSelectedJob(null);
      }
      setApplying(false);
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-extrabold text-[#113253]">All Job Opportunities</h2>
        <p className="text-gray-600 mt-3">Browse all exclusive roles spanning multiple categories globally.</p>
      </div>
      
      {loading ? (
        <div className="text-center py-20 text-gray-500 font-bold">Loading remote jobs...</div>
      ) : (
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
              <h4 className="text-2xl font-extrabold text-[#113253] mb-3 group-hover:text-[#489895] transition-colors">{job.title}</h4>
              <p className="text-sm bg-gray-100 text-[#113253] font-bold px-3 py-1 inline-block rounded mb-4 w-max">{job.qualification}</p>
              <p className="text-gray-500 line-clamp-3 leading-relaxed mb-6 flex-grow">{job.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {job.location && <span className="bg-[#e2f0ef] text-[#489895] text-xs font-bold px-2 py-1 rounded">📍 {job.location}</span>}
                {job.years_experience && <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">⏳ {job.years_experience} Yrs</span>}
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
      )}
      {/* Apply Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto hidden-scrollbar">
              <button disabled={applying} onClick={() => {setSelectedJob(null); setAnalysisResult(null);}} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 disabled:opacity-50">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>

              {!analysisResult ? (
                <>
                  <h3 className="text-3xl font-extrabold text-[#113253] mb-2">Apply for Role</h3>
                  <p className="text-gray-500 font-medium mb-6">Upload your CV to automatically analyze and apply to this job.</p>
                  
                  <div className="bg-[#f8fafc] p-4 rounded-xl border border-gray-100 mb-6 flex flex-col gap-2">
                    <p className="font-bold text-[#4facfe] text-lg">{selectedJob.title}</p>
                    <div className="flex gap-2">
                      <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded font-bold">{selectedJob.qualification}</span>
                      {selectedJob.location && <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded font-bold">📍 {selectedJob.location}</span>}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Compulsory Document (PDF CV)*</label>
                    <input 
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setCvFile(e.target.files[0])}
                      className="w-full text-sm font-medium border border-gray-300 p-4 rounded-xl focus:outline-none focus:border-[#4facfe] focus:ring-1 focus:ring-[#4facfe] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#e2f0ef] file:text-[#489895] hover:file:bg-[#cbeae8]"
                    />
                  </div>

                  <button 
                    onClick={processApplication} 
                    disabled={applying} 
                    className="w-full bg-gradient-to-r from-[#4facfe] to-[#806bf8] text-white py-4 rounded-xl font-extrabold shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {applying ? <><span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> Analyzing CV...</> : 'Analyze CV & Process Application'}
                  </button>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <h3 className="text-3xl font-black text-[#113253] mb-2">Application Successful!</h3>
                  <div className="bg-[#f0f9ff] p-6 rounded-2xl border border-blue-100 my-6 inline-block">
                    <p className="text-sm font-bold text-blue-600 uppercase mb-1">Your ATS Score</p>
                    <p className="text-5xl font-black text-[#113253]">{analysisResult.ats_score}<span className="text-2xl text-gray-400">/100</span></p>
                    <p className="text-gray-600 mt-3 text-sm font-medium leading-relaxed max-w-sm">{analysisResult.analysis}</p>
                  </div>
                  
                  {analysisResult.suggested_roles && analysisResult.suggested_roles.length > 0 && (
                    <div className="text-left mt-4 border-t border-gray-100 pt-6">
                      <h4 className="text-lg font-extrabold text-[#113253] mb-3">Jobs Matching Your CV:</h4>
                      <div className="flex flex-wrap gap-2">
                         {analysisResult.suggested_roles.map((srole, i) => (
                           <span key={i} className="bg-gray-100 text-[#489895] px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">{srole}</span>
                         ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-4 font-medium italic">Explore these roles in our Jobs section for better chances!</p>
                    </div>
                  )}

                  <button onClick={() => { setSelectedJob(null); setAnalysisResult(null); }} className="mt-8 w-full py-4 border-2 border-[#113253] text-[#113253] font-extrabold rounded-xl hover:bg-[#113253] hover:text-white transition-all uppercase tracking-wider text-sm">
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Jobs;
