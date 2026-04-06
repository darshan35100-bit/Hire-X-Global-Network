import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-[#113253] text-[#F1F5F9] py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Contact details */}
          <div className="space-y-4">
            <h4 className="text-xl font-bold mb-4 border-b border-[#489895] pb-2 inline-block">Contact details</h4>
            <p className="text-sm opacity-80 leading-relaxed font-light">123 Hire-X Way<br />Suite 100<br />Tech City, TC 12345</p>
            <p className="text-sm opacity-80 mt-2 font-light">Email: info@hire-x.com<br />Phone: +1 (555) 123-4567</p>
          </div>

          {/* Column 2: Services available */}
          <div className="space-y-4">
            <h4 className="text-xl font-bold mb-4 border-b border-[#489895] pb-2 inline-block">Services available</h4>
            <ul className="space-y-3 text-sm opacity-80 font-light">
              <li><Link to="/jobs" className="hover:text-[#489895] transition-colors">Job Placement</Link></li>
              <li><Link to="/articles" className="hover:text-[#489895] transition-colors">Resume Review</Link></li>
              <li><Link to="/articles" className="hover:text-[#489895] transition-colors">Interview Prep</Link></li>
              <li><Link to="/login" className="hover:text-[#489895] transition-colors">Career Coaching</Link></li>
            </ul>
          </div>

          {/* Column 3: About us */}
          <div className="space-y-4">
            <h4 className="text-xl font-bold mb-4 border-b border-[#489895] pb-2 inline-block">About us</h4>
            <ul className="space-y-3 text-sm opacity-80 font-light">
              <li><Link to="/" className="hover:text-[#489895] transition-colors">Our Story</Link></li>
              <li><Link to="/" className="hover:text-[#489895] transition-colors">Meet the Team</Link></li>
              <li><Link to="/jobs" className="hover:text-[#489895] transition-colors">Careers at Hire-X</Link></li>
              <li><Link to="/articles" className="hover:text-[#489895] transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Column 4: Helpline Resources */}
          <div className="space-y-4">
            <h4 className="text-xl font-bold mb-4 border-b border-[#489895] pb-2 inline-block">Helpline Resources</h4>
            <ul className="space-y-3 text-sm opacity-80 font-light">
              <li><Link to="/articles" className="hover:text-[#489895] transition-colors">Help Center</Link></li>
              <li><Link to="/" className="hover:text-[#489895] transition-colors">FAQ</Link></li>
              <li><Link to="/" className="hover:text-[#489895] transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-[#489895] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-[#489895] border-opacity-30 text-center text-sm opacity-60 font-light">
          <p>&copy; {new Date().getFullYear()} Hire-X. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
