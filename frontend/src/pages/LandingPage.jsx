import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets.js";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";
import PageLoader from "../components/PageLoader.jsx";


const Main = () => {
    const [loading, setLoading] = useState(true);
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  }, []);

   useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
  
      return () => clearTimeout(timer);
    }, []);
    if (loading) {
      return <PageLoader />;
    }

  return (
    <>
      <Navbar />
      <div className="w-full overflow-x-hidden bg-gradient-to-br from-[#0a0f1c] via-[#0f1d3d] to-[#0a0f1c] text-white">
      {/* ---------------Home Section--------------- */}
      <herosection
        id="home"
        className="min-h-screen bg-gradient-to-r from-[#0a0f1c] via-[#0f1d3d] to-[#0a0f1c] flex items-center pt-20"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 md:px-12 lg:px-16 gap-10">
          <div className="headings w-full md:w-1/2 space-y-6 text-center md:text-left">
            <div className="animate-para inline-block text-white bg-[#0a0f1c]/70 border border-gray-700 shadow-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full animate-glow mt-2">
              <p><b>IU</b> - Iqra University - Final Year Project</p>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-extrabold leading-snug tracking-tight">
              Transform your{" "}
              <span className="text-indigo-400 pb-2 whitespace-nowrap">
                Hiring Process
              </span>{" "}
              <span className="block mt-2 whitespace-nowrap">
                with Intelligent AI
              </span>
            </h1>

            <p className="text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-md sm:max-w-lg mx-auto md:mx-0">
              Streamline your recruitment with our advanced AI system that
              parses resumes, screens them, and intelligently shortlists the
              perfect matches for your organization.
            </p>

            <div>
            <a href="#features">
              <button className="px-4 py-1 sm:px-5 sm:py-2 rounded-full bg-white text-black font-medium shadow-sm hover:bg-gradient-to-r from-[#0a0f1c] via-[#0f1d3d] to-[#0a0f1c] hover:text-white hover:border hover:shadow-md transition-all duration-300 text-sm sm:text-base">
                Learn More
              </button>
              </a>
            </div>
          </div>

          <div className="head-img w-full md:w-1/2 flex justify-center">
            <div className="w-[95%] sm:w-[85%] lg:w-[70%] rounded-xl border border-gray-700 overflow-hidden shadow-lg">
              <img
                className="rounded-2xl shadow-lg transition-transform duration-500 hover:scale-105"
                src={assets.resume}
                alt="Resume AI"
              />
            </div>
          </div>
        </div>
      </herosection>

      {/* ---------------About Section--------------- */}
      <aboutsection
        id="about"
        className="relative bg-gradient-to-r from-[#0a0f1c] via-[#0f1d3d] to-[#0a0f1c] min-h-screen flex items-center py-20 sm:py-24 md:py-32"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-white w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-5 sm:space-y-6 md:space-y-8 text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white text-gradient animate-fadeIn">
                About RecruitAI
              </h2>
              <p className="text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed animate-fadeIn delay-100">
                RecruitAI helps organizations hire smarter and faster with
                AI-driven parsing and ranking, reducing manual effort and
                improving outcomes.
              </p>
              <p className="text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed animate-fadeIn delay-200">
                Focused on accuracy, speed, and fairness, RecruitAI streamlines
                screening and supports better hiring decisions.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer">
              <ul className="space-y-5 sm:space-y-6 text-slate-200 text-sm sm:text-base md:text-lg">
                <li className="flex items-start gap-3 sm:gap-4 hover:text-indigo-400 transition-colors duration-300">
                  <span className="mt-1 inline-block h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.6)]"></span>
                  AI-assisted resume parsing and screening
                </li>
                <li className="flex items-start gap-3 sm:gap-4 hover:text-indigo-400 transition-colors duration-300">
                  <span className="mt-1 inline-block h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.6)]"></span>
                  Candidate ranking aligned to job requirements
                </li>
                <li className="flex items-start gap-3 sm:gap-4 hover:text-indigo-400 transition-colors duration-300">
                  <span className="mt-1 inline-block h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.6)]"></span>
                  Fast, transparent insights to speed up hiring
                </li>
              </ul>
            </div>
          </div>
        </div>
      </aboutsection>

      {/* ---------------Features Section--------------- */}
      <featuressection
        id="features"
        className="min-h-screen bg-gradient-to-r from-[#0a0f1c] via-[#0f1d3d] to-[#0a0f1c] flex items-center py-20 md:py-28"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-white w-full text-center">
          {/* Section Heading */}
          <div className="space-y-4 mb-12 md:mb-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Why Choose RecruitAI?
            </h1>
            <p className="pt-2 max-w-2xl mx-auto text-gray-300 text-sm sm:text-base md:text-lg">
              Our intelligent system combines AI technology with human expertise
              to deliver accurate candidate screening and ranking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 place-items-center">
            <div className="card w-full max-w-xs h-auto p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-indigo-400 hover:scale-105 transition-all duration-300 cursor-pointer text-left">
              <img
                className="w-10 mb-3 invert brightness-0"
                src={assets.screening}
                alt="Screening"
              />
              <h2 className="text-white font-semibold text-lg mb-1">
                Intelligent Screening
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                AI algorithms analyze resumes for skills, education, and
                experience according to job requirements.
              </p>
            </div>

            <div className="card w-full max-w-xs h-auto p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-indigo-400 hover:scale-105 transition-all duration-300 cursor-pointer text-left">
              <img
                className="w-10 mb-3 invert brightness-0"
                src={assets.idea}
                alt="Idea"
              />
              <h2 className="text-white font-semibold text-lg mb-1">
                Smart Ranking
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Automatically rank candidates based on skills and job
                requirements using machine learning.
              </p>
            </div>

            <div className="card w-full max-w-xs h-auto p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-indigo-400 hover:scale-105 transition-all duration-300 cursor-pointer text-left">
              <img
                className="w-10 mb-3 invert brightness-0"
                src={assets.lighting}
                alt="Fast"
              />
              <h2 className="text-white font-semibold text-lg mb-1">
                Lightning Fast
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Get instant insights and quickly shortlist candidates to
                accelerate your hiring process.
              </p>
            </div>
          </div>
        </div>
      </featuressection>

      {/* --------------- Contact Us Section --------------- */}
      <contactsection
        id="contact"
        className="min-h-screen bg-gradient-to-r from-[#0a0f1c] via-[#0f1d3d] to-[#0a0f1c] flex items-center justify-center py-24 px-6"
      >
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-10">
          <div className="flex flex-col justify-center text-white space-y-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold">
              Get in Touch
            </h2>
            <p className="text-gray-300 text-lg">
              Have a question, idea, or collaboration in mind? Let’s connect and
              build something amazing together.
            </p>

            <div className="flex gap-4 pt-4">
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-600 transition"
              >
                <Facebook className="text-white w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-600 transition"
              >
                <Instagram className="text-white w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-600 transition"
              >
                <Twitter className="text-white w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-600 transition"
              >
                <Linkedin className="text-white w-5 h-5" />
              </a>
            </div>

            <div className="mt-6">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.409802017038!2d67.08231431500372!3d24.8395749840651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33d3d62c8d0db%3A0x7e55e236d13b6052!2sShaheed-e-Millat%20Rd%2C%20Phase%202%20Defence%20View%20Housing%20Society%2C%20Karachi%2C%2075500!5e0!3m2!1sen!2s!4v1692456789012"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-2xl shadow-lg border border-white/10"
              ></iframe>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <form className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 space-y-5 border border-white/10 w-full max-w-md">
              <div>
                <label className="block text-gray-300 mb-1 text-sm">Name</label>
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 text-sm">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 text-sm">
                  Message
                </label>
                <textarea
                  rows="4"
                  placeholder="Message..."
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-6 rounded-lg bg-indigo-600 text-white font-medium flex items-center justify-center gap-2 text-sm hover:bg-indigo-500/10 hover:shadow-lg transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </contactsection>
      <herosection />
      <aboutsection />
      <featuressection />
      <contactsection />
    </div>
      <Footer />
    </>
  );
};

export default Main;
