import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const locationFragment = useLocation().search; // ?category=Web
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    let url = '/api/jobs';
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setJobs(data);
        else setJobs([]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [locationFragment]);

  const handleApply = async (jobId) => {
    if (!user) {
      alert("Please register to apply for jobs!");
      navigate('/login', { state: { isRegister: true } });
      return;
    }
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ job_id: jobId })
      });
      const data = await res.json();
      if(res.ok) {
        alert("Application submitted successfully!");
      } else {
        alert(data.error || "Failed to apply");
      }
    } catch(err) {
      alert("Error applying. Try again later.");
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.length > 0 ? jobs.map(job => (
            <div key={job.id} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg flex flex-col group transition-all hover:-translate-y-1 hover:shadow-xl">
              <h4 className="text-2xl font-extrabold text-[#113253] mb-3 group-hover:text-[#489895] transition-colors">{job.title}</h4>
              <p className="text-sm bg-gray-100 text-[#113253] font-bold px-3 py-1 inline-block rounded mb-4 w-max">{job.qualification}</p>
              <p className="text-gray-500 line-clamp-3 leading-relaxed mb-6 flex-grow">{job.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {job.location && <span className="bg-[#e2f0ef] text-[#489895] text-xs font-bold px-2 py-1 rounded">📍 {job.location}</span>}
                {job.years_experience && <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">⏳ {job.years_experience} Yrs</span>}
              </div>

              <button onClick={() => handleApply(job.id)} className="mt-auto w-full py-4 bg-[#f8fafc] text-[#113253] font-black rounded-2xl group-hover:bg-[#113253] group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-2 group-hover:brightness-90 group-hover:shadow-[0_15px_30px_rgba(17,50,83,0.3)] uppercase tracking-widest text-[12px] shadow-sm relative z-10">
                Apply Now
              </button>
            </div>
          )) : (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
               <p className="text-gray-500 font-bold">No jobs currently available.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Jobs;
