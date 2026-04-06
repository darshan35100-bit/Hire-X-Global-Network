import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import AdminJobPosting from './components/AdminJobPosting';
import Footer from './components/Footer';
import Login from './components/Login';
import Jobs from './components/Jobs';
import Articles from './components/Articles';
import { AuthContext } from './context/AuthContext';
import Profile from './components/Profile';
import { NotificationContext } from './context/NotificationContext';

function GlobalNotificationListener() {
  const { user } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);

  useEffect(() => {
    const source = new EventSource('/api/notifications/stream');
    source.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      if (parsedData.type === 'SHORTLISTED') {
        if(!parsedData.user_id || (user && parsedData.user_id === user.id)) {
          addNotification(parsedData.message, 'success');
        }
      }
      if (parsedData.type === 'SUCCESS') {
        if(user && parsedData.user_id === user.id) {
          addNotification(parsedData.message, 'success');
        }
      }
      if (parsedData.type === 'NEW_APPLICATION') {
        if(user && parsedData.user_id === user.id) {
          addNotification(parsedData.message, 'success');
        }
      }
    };
    return () => source.close();
  }, [user, addNotification]);

  return null;
}

function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <Router>
      <GlobalNotificationListener />
      <div className="min-h-screen bg-[#F1F5F9] font-sans flex flex-col">
        {/* Custom Header Layout */}
        <header className="bg-white shadow">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">

              {/* Logo/Name on far left */}
              <div className="flex-shrink-0 flex items-center cursor-pointer">
                <div className="w-10 h-10 bg-[#113253] rounded flex items-center justify-center text-white font-bold text-xl mr-3 shadow-md">
                  HX
                </div>
                <h1 className="text-2xl font-extrabold text-[#113253] tracking-tight">Hire-X</h1>
              </div>

              {/* Navigation Links on right */}
              <nav className="hidden lg:flex space-x-10 items-center">
                <Link to="/" className="text-[#113253] font-bold hover:text-[#489895] transition-colors">Home</Link>
                <Link to="/jobs" className="text-[#113253] font-bold hover:text-[#489895] transition-colors">Recent Jobs</Link>
                
                {user?.role === 'admin' || user?.role === 'employer' ? (
                  <Link to="/admin" className="text-[#113253] font-bold hover:text-[#489895] transition-colors">Post a Job / Dashboard</Link>
                ) : null}
                
                <Link to="/articles" className="text-[#113253] font-bold hover:text-[#489895] transition-colors">Articles</Link>
                
                {user ? (
                  <div className="flex items-center space-x-6">
                    <Link to="/profile" className="flex items-center space-x-3 group">
                      <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-md overflow-hidden flex items-center justify-center group-hover:ring-2 group-hover:ring-[#806bf8] transition-all">
                        {user.avatar ? (
                           <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
                        ) : (
                           <span className="font-extrabold text-[#113253]">{user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="text-[#489895] font-bold group-hover:text-[#806bf8] transition-colors">Hi, {user.name.split(' ')[0]}</span>
                    </Link>
                    <button onClick={logout} className="px-5 py-2.5 bg-red-500 text-white font-extrabold rounded shadow-md hover:bg-red-600 transition-all duration-300 transform hover:-translate-y-2 hover:brightness-75 hover:shadow-lg text-sm uppercase tracking-wider">
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="px-6 py-2.5 bg-[#489895] text-white font-extrabold rounded shadow-md transition-all duration-300 transform hover:-translate-y-2 hover:brightness-75 hover:shadow-lg text-sm uppercase tracking-wider">
                    Login / Register
                  </Link>
                )}
              </nav>

              {/* Mobile menu button */}
              <div className="lg:hidden flex items-center">
                <button className="text-[#113253] hover:text-[#489895] outline-none">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

            </div>
          </div>
        </header>

        {/* Dynamic Routes */}
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminJobPosting />} />
            <Route path="/login" element={<Login />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
