import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminJobPosting = () => {
  const [formData, setFormData] = useState({ 
    title: '', 
    qualification: '', 
    description: '',
    education_level: '',
    years_experience: '',
    location: ''
  });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock Applications functionality 
  const [applications, setApplications] = useState([]);
  const [formError, setFormError] = useState('');

  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if(!user || user.role !== 'admin') {
      alert("Unauthorized Access. Admins only.");
      navigate('/');
      return;
    }

    fetch('/api/applications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
          setApplications(data);
        }
      })
      .catch(console.error);
  }, [user, token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title || !formData.qualification || !formData.description) {
      setFormError('Please fill in Title, Qualification, and Description.');
      return;
    }

    setIsSubmitting(true);
    setStatus('');
    
    try {
      // Numbers correctly formatted
      const payload = {
        ...formData,
        years_experience: formData.years_experience ? parseInt(formData.years_experience) : null
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
        setFormData({ title: '', qualification: '', description: '', education_level: '', years_experience: '', location: '' });
      } else {
        setStatus('error');
      }
    } catch(err) {
      console.error(err);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const handleShortlist = async (appId) => {
    try {
      const res = await fetch(`/api/applications/${appId}/shortlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });
      if(res.ok) {
        // Notification fired!
        alert(`Candidate Shortlisted! Notification sent in real-time.`);
        setApplications(applications.map(app => app.id === appId ? { ...app, status: 'Shortlisted' } : app));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if(!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-[#113253]">Admin Portal</h2>
        <p className="text-gray-500 mt-2">Manage job postings and review applications matching your criteria.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-[#113253] px-8 py-6 relative">
              <h3 className="text-2xl font-bold text-white relative z-10 flex items-center">
                Create New Job Posting
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 flex flex-col md:flex-row gap-8">
              
              {/* Primary Requirements Sidebar / Matching Criteria */}
              <div className="w-full md:w-1/3 space-y-6 bg-gray-50 p-5 rounded-2xl border border-gray-200">
                <h4 className="text-lg font-bold text-[#113253] mb-4 border-b pb-2 border-gray-200">Matching Criteria</h4>
                
                {formError && <div className="text-red-500 font-bold mb-4">{formError}</div>}
                
                <div>
                  <label className="block text-sm font-bold text-[#113253] mb-2">
                    Education Level
                  </label>
                  <select 
                    value={formData.education_level}
                    onChange={e => setFormData({...formData, education_level: e.target.value})}
                    className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-[#489895]"
                  >
                    <option value="">Any</option>
                    <option value="High School">High School</option>
                    <option value="Associate Degree">Associate Degree</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Ph.D.">Ph.D.</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#113253] mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 3"
                    value={formData.years_experience}
                    onChange={e => setFormData({...formData, years_experience: e.target.value})}
                    className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-[#489895]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[#113253] mb-2">
                    General Qualification
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B.Tech CS"
                    value={formData.qualification}
                    onChange={e => setFormData({...formData, qualification: e.target.value})}
                    className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-[#489895]"
                  />
                </div>
              </div>

              {/* Main Content Fields */}
              <div className="w-full md:w-2/3 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#113253] mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    required
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-[#489895] text-gray-800"
                    placeholder="e.g. Senior Frontend Developer"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#113253] mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-[#489895] text-gray-800"
                    placeholder="e.g. New York, NY"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  />
                </div>

                <div>
                   <label className="block text-sm font-bold text-[#113253] mb-2">
                     Job Description
                   </label>
                   <textarea
                     rows={6}
                     required
                     className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-[#489895] text-gray-800 resize-y"
                     placeholder="Provide the complete role description..."
                     value={formData.description}
                     onChange={e => setFormData({...formData, description: e.target.value})}
                   />
                </div>

                <div className="pt-4 flex items-center justify-between">
                  {status === 'success' ? (
                    <span className="text-green-600 font-bold">Published successfully!</span>
                  ) : <div/>}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`
                      py-3 px-8 rounded-lg shadow-md font-bold text-white transition-all 
                      ${isSubmitting ? 'bg-gray-400' : 'bg-[#489895] hover:bg-[#387f7c]'}
                    `}
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish Job'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Panel: Applications Monitor */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
          <div className="bg-[#113253] px-6 py-4">
            <h3 className="text-xl font-bold text-white">Matching Applicants</h3>
          </div>
          <div className="p-6 flex-1 overflow-y-auto space-y-4 max-h-[600px]">
            {applications.filter(app => {
              // Dynamic Matching Logic
              let matches = true;
              if (formData.education_level && app.education !== formData.education_level) {
                // simple exact match layout for demonstration
                matches = false; 
              }
              if (formData.years_experience && parseInt(app.experience) < parseInt(formData.years_experience)) {
                matches = false;
              }
              return matches;
            }).map(app => (
              <div key={app.id} className="border border-gray-200 p-4 rounded-xl bg-gray-50 shadow-sm border-l-4 border-l-[#489895]">
                <h4 className="font-bold text-[#113253]">{app.applicant_name}</h4>
                <p className="text-sm text-gray-600">{app.role}</p>
                <div className="mt-2 text-xs font-bold text-[#489895] flex gap-2">
                  <span className="bg-[#e2f0ef] px-2 py-1 rounded">Edu: {app.education || 'N/A'}</span>
                  <span className="bg-[#e2f0ef] px-2 py-1 rounded">Exp: {app.experience || '0'} Yrs</span>
                </div>
                {app.status === 'Shortlisted' ? (
                  <div className="mt-3 w-full bg-green-100 text-green-700 text-sm font-bold py-2 rounded text-center">
                    Shortlisted
                  </div>
                ) : (
                  <button 
                    onClick={() => handleShortlist(app.id)}
                    className="mt-3 w-full bg-[#113253] hover:bg-[#0c243c] text-white text-sm font-bold py-2 rounded transition-colors"
                  >
                    Shortlist Candidate
                  </button>
                )}
              </div>
            ))}
            {applications.length === 0 && <p className="text-gray-500 text-sm">No matching applications found.</p>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminJobPosting;
