// ONLY UI UPDATED — LOGIC UNCHANGED

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
          body: JSON.stringify({ cv_pdf_base64: base64Data, job_description: selectedJob.description, profile_name: user?.name, mimeType: cvFile.type || 'application/pdf' })
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
      if (appRes.ok) setFinalSubmitSuccess(true);
      else alert("Failed to apply");
    } catch {
      alert("Network error");
    }
    setSubmittingApp(false);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col overflow-hidden">

      {/* fancy layered background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgb(200,255,240)] via-[rgb(180,220,255)] to-[rgb(255,220,220)]"></div>

      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(0,255,200,0.35),transparent_70%)] blur-3xl"></div>
      <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(255,100,120,0.25),transparent_70%)] blur-3xl"></div>
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(0,150,255,0.25),transparent_70%)] blur-2xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 py-16 w-full">

        <div className="mb-12 text-center">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
            All Job Opportunities
          </h2>
          <p className="text-gray-600 mt-3">Browse all exclusive roles globally.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-600 font-bold">Loading...</div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                <h4 className="text-xl font-bold text-gray-800 mb-1">{job.title}</h4>
                <p className="text-xs text-gray-500 mb-2">{job.company_name}</p>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{job.description}</p>

                <div className="flex gap-2 mb-4 flex-wrap">
                  {job.location && <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full">{job.location}</span>}
                  {job.years_experience && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{job.years_experience} Exp</span>}
                </div>

                <button
                  onClick={() => handleApplyClick(job)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 text-white font-bold shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95"
                >
                  Apply Now
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
