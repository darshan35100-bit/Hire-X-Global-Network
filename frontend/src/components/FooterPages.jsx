import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const PageWrapper = ({ title, children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-[#f1f5f9] py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-5xl md:text-6xl font-black text-[#113253] mb-12 tracking-tight text-center">
          {title}
        </h1>
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[40px] p-8 md:p-14 text-gray-700 leading-relaxed text-lg">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export const OurStory = () => (
  <PageWrapper title="Our Story">
    <p className="mb-6">
      Founded in 2024, **Hire-X Global Network** emerged from a simple yet powerful vision: to bridge the gap between world-class talent and revolutionary opportunities. We believe that a career is more than just a job—it's a journey of identity, growth, and impact.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
      <div className="bg-[#489895]/10 p-6 rounded-3xl border border-[#489895]/20">
        <h3 className="text-xl font-black text-[#489895] mb-2 uppercase tracking-widest">Our Mission</h3>
        <p className="text-sm font-medium">To democratize access to elite career paths through intelligent matching and transparent connections.</p>
      </div>
      <div className="bg-[#806bf8]/10 p-6 rounded-3xl border border-[#806bf8]/20">
        <h3 className="text-xl font-black text-[#806bf8] mb-2 uppercase tracking-widest">Our Vision</h3>
        <p className="text-sm font-medium">To build the world's most trusted ecosystem for professional excellence and global recruitment.</p>
      </div>
    </div>
    <p className="mb-6 font-bold text-[#113253]">
      At Hire-X, we don't just list jobs. We engineer success. Our platform uses bleeding-edge technology to analyze your unique skills and pair you with companies that share your values and ambition.
    </p>
    <p>
      Join us as we redefine the future of work. Whether you're an aspirant looking for your ultimate break or an employer scaling for greatness, Hire-X is your strategic partner in the global market.
    </p>
  </PageWrapper>
);

export const MeetTheTeam = () => (
  <PageWrapper title="Meet the Team">
    <p className="text-center mb-12 font-medium">The visionaries behind the Hire-X Ecosystem.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="flex flex-col items-center text-center group">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 mb-4 shadow-xl group-hover:scale-110 transition-transform"></div>
        <h3 className="text-2xl font-black text-[#113253]">Darshan K M</h3>
        <p className="text-[#489895] font-black uppercase tracking-tighter text-sm">Founder & Chief Architect</p>
        <p className="text-sm mt-4 text-gray-500 font-medium">Leading the charge in AI-driven recruitment and platform stability.</p>
        <p className="text-xs mt-2 text-[#113253] font-bold">darshankm35100@gmail.com</p>
      </div>
      <div className="flex flex-col items-center text-center group">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-400 to-pink-600 mb-4 shadow-xl group-hover:scale-110 transition-transform"></div>
        <h3 className="text-2xl font-black text-[#113253]">The Visionaries</h3>
        <p className="text-[#806bf8] font-black uppercase tracking-tighter text-sm">Global Support Network</p>
        <p className="text-sm mt-4 text-gray-500 font-medium">A dedicated team of experts ensuring 24/7 success for our users.</p>
        <p className="text-xs mt-2 text-[#113253] font-bold">support@hire-x.com</p>
      </div>
    </div>
    <div className="mt-16 pt-10 border-t border-gray-100 text-center">
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Connect with us on LinkedIn for more updates.</p>
    </div>
  </PageWrapper>
);

export const Careers = () => (
  <PageWrapper title="Careers at Hire-X">
    <p className="mb-8">
      We're looking for disruptors, dreamers, and doers. At Hire-X, you'll work on the front lines of career technology, building tools that change lives globally.
    </p>
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <h3 className="text-xl font-bold text-[#113253]">Full Stack Engineer</h3>
        <p className="text-sm text-gray-500 font-medium mt-1">Remote | Full-time | $120k - $180k</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <h3 className="text-xl font-bold text-[#113253]">AI Specialist</h3>
        <p className="text-sm text-gray-500 font-medium mt-1">Global | Full-time | $140k - $220k</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <h3 className="text-xl font-bold text-[#113253]">Growth Strategist</h3>
        <p className="text-sm text-gray-500 font-medium mt-1">Hybrid (Bengaluru) | Full-time | $80k - $120k</p>
      </div>
    </div>
    <p className="mt-10 text-center font-black text-[#489895] uppercase tracking-widest text-sm">
      Send your profile to darshankm35100@gmail.com to join the revolution.
    </p>
  </PageWrapper>
);

export const Blog = () => (
  <PageWrapper title="Hire-X Insights">
    <p className="text-center mb-12 font-medium">Read the latest on career growth and market trends.</p>
    <div className="space-y-12">
      <article className="border-b border-gray-100 pb-10">
        <h2 className="text-3xl font-black text-[#113253] mb-4 hover:text-[#489895] cursor-pointer transition-colors">Mastering the Modern Resume in 2026</h2>
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-4">May 1, 2026 • 6 min read</p>
        <p className="mb-4">The landscape of recruitment has shifted. It's no longer just about keywords; it's about narrative and identity. Learn how Hire-X is helping candidates stand out...</p>
        <button className="text-[#806bf8] font-black uppercase tracking-widest text-xs">Read More →</button>
      </article>
      <article className="border-b border-gray-100 pb-10">
        <h2 className="text-3xl font-black text-[#113253] mb-4 hover:text-[#489895] cursor-pointer transition-colors">Why Personal Branding is Your Best Asset</h2>
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-4">April 25, 2026 • 8 min read</p>
        <p className="mb-4">Your digital footprint is your resume before you even submit it. We explore the strategies for building a premium professional brand that attracts elite employers...</p>
        <button className="text-[#806bf8] font-black uppercase tracking-widest text-xs">Read More →</button>
      </article>
    </div>
  </PageWrapper>
);

export const FAQ = () => (
  <PageWrapper title="Frequently Asked Questions">
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-black text-[#113253] mb-2">How does Hire-X ATS score work?</h3>
        <p className="text-sm font-medium">Our system uses AI to analyze your PDF resume against specific job requirements, evaluating skills, experience, and relevancy to provide a score from 0 to 100.</p>
      </div>
      <div>
        <h3 className="text-xl font-black text-[#113253] mb-2">Is my data secure?</h3>
        <p className="text-sm font-medium">Absolutely. We use end-to-end encryption and secure database protocols to ensure your personal information and documents are protected at all times.</p>
      </div>
      <div>
        <h3 className="text-xl font-black text-[#113253] mb-2">Can I apply without a profile?</h3>
        <p className="text-sm font-medium">No, you must register and complete your profile to access elite opportunities and Hire-IQ features.</p>
      </div>
      <div>
        <h3 className="text-xl font-black text-[#113253] mb-2">How do I contact the Main Admin?</h3>
        <p className="text-sm font-medium">You can use the 'Immediate Contact' button in the footer to send suggestions or complaints directly to the administration.</p>
      </div>
    </div>
  </PageWrapper>
);

export const Terms = () => (
  <PageWrapper title="Terms of Service">
    <div className="space-y-6 text-sm font-medium">
      <p>Effective Date: May 1, 2024</p>
      <h3 className="text-lg font-black text-[#113253] mt-8 uppercase tracking-widest">1. Acceptance of Terms</h3>
      <p>By accessing Hire-X Global Network, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
      <h3 className="text-lg font-black text-[#113253] mt-8 uppercase tracking-widest">2. User Conduct</h3>
      <p>Users are prohibited from uploading fraudulent documents, misrepresenting their identity, or attempting to breach platform security.</p>
      <h3 className="text-lg font-black text-[#113253] mt-8 uppercase tracking-widest">3. Limitation of Liability</h3>
      <p>Hire-X is a matching platform. We do not guarantee employment and are not liable for interactions between users and third-party employers.</p>
      <h3 className="text-lg font-black text-[#113253] mt-8 uppercase tracking-widest">4. Modifications</h3>
      <p>We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms.</p>
    </div>
  </PageWrapper>
);

export const Privacy = () => (
  <PageWrapper title="Privacy Policy">
    <div className="space-y-6 text-sm font-medium">
      <p>Effective Date: May 1, 2024</p>
      <h3 className="text-lg font-black text-[#113253] mt-8 uppercase tracking-widest">1. Information Collection</h3>
      <p>We collect personal information such as name, email, and resume data to facilitate job matching and platform features.</p>
      <h3 className="text-lg font-black text-[#113253] mt-8 uppercase tracking-widest">2. Use of Data</h3>
      <p>Your data is used to calculate ATS scores, provide Hire-IQ assistance, and connect you with potential employers.</p>
      <h3 className="text-lg font-black text-[#113253] mt-8 uppercase tracking-widest">3. Data Security</h3>
      <p>We implement robust technical measures to protect your data. We do not sell your personal information to third parties.</p>
      <h3 className="text-lg font-black text-[#113253] mt-8 uppercase tracking-widest">4. Your Rights</h3>
      <p>You have the right to access, modify, or destroy your account and all associated data at any time through your profile settings.</p>
    </div>
  </PageWrapper>
);

export const ResumeService = () => (
  <PageWrapper title="Premium Resume Review">
    <div className="text-center mb-10">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      </div>
      <p className="font-bold text-[#113253]">Get your resume analyzed by the industry's most advanced ATS engine.</p>
    </div>
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
        <h3 className="text-lg font-black text-[#113253] mb-2 uppercase tracking-widest">AI Analysis</h3>
        <p className="text-sm">Upload your resume to our 'Explore Jobs' section to get an instant ATS score and detailed feedback on matching your profile with top roles.</p>
      </div>
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
        <h3 className="text-lg font-black text-[#113253] mb-2 uppercase tracking-widest">Expert Feedback</h3>
        <p className="text-sm">Our premium members get direct access to personalized resume editing tips from our team of global recruiters.</p>
      </div>
    </div>
    <div className="mt-12 flex justify-center">
      <button className="bg-[#113253] text-white font-black py-4 px-10 rounded-2xl shadow-xl hover:scale-105 transition-transform uppercase tracking-widest text-xs">Request Review</button>
    </div>
  </PageWrapper>
);

export const InterviewPrep = () => (
  <PageWrapper title="Interview Mastery">
    <div className="text-center mb-10">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 012 2v2H9a2 2 0 01-2-2v-2.586l-1.414-1.414A2 2 0 016 10V6a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
      </div>
      <p className="font-bold text-[#113253]">Master the art of the technical and behavioral interview.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-black text-[#113253] mb-2 text-sm uppercase">STAR Method</h3>
        <p className="text-xs text-gray-500">Learn to structure your behavioral answers for maximum impact.</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-black text-[#113253] mb-2 text-sm uppercase">Technical Screens</h3>
        <p className="text-xs text-gray-500">Preparation guides for LeetCode, System Design, and Case Studies.</p>
      </div>
    </div>
    <div className="mt-12 text-center">
      <p className="text-sm font-medium text-gray-400">Join our weekly webinars to practice live mock interviews with seniors.</p>
    </div>
  </PageWrapper>
);

export const CareerCoaching = () => (
  <PageWrapper title="Elite Career Coaching">
    <div className="bg-gradient-to-r from-[#113253] to-[#489895] p-10 rounded-[40px] text-white mb-12 shadow-2xl">
      <h2 className="text-3xl font-black mb-4">Direct Guidance from Industry Leaders.</h2>
      <p className="text-emerald-50/80 mb-6 font-medium">Navigating your career path shouldn't be a solo journey. Get paired with a mentor who has been where you want to go.</p>
      <button className="bg-white text-[#113253] font-black py-4 px-10 rounded-2xl shadow-lg hover:brightness-90 transition-all uppercase tracking-widest text-xs">Find a Mentor</button>
    </div>
    <div className="space-y-8">
      <div className="flex items-start gap-6">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0 text-xl font-bold">01</div>
        <div><h4 className="text-lg font-black text-[#113253] mb-1">Path Optimization</h4><p className="text-sm text-gray-500">Identify the highest leverage moves for your career trajectory.</p></div>
      </div>
      <div className="flex items-start gap-6">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0 text-xl font-bold">02</div>
        <div><h4 className="text-lg font-black text-[#113253] mb-1">Skill Gap Analysis</h4><p className="text-sm text-gray-500">Discover exactly what's holding you back from your next promotion.</p></div>
      </div>
      <div className="flex items-start gap-6">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0 text-xl font-bold">03</div>
        <div><h4 className="text-lg font-black text-[#113253] mb-1">Negotiation Strategy</h4><p className="text-sm text-gray-500">Learn to communicate your value and secure the compensation you deserve.</p></div>
      </div>
    </div>
  </PageWrapper>
);
