import React from "react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { scrollToSection } from "../utils/scroll";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer
      id="footer"
      className="w-full overflow-x-hidden bg-gradient-to-t from-[#070810] via-[#071426] to-[#0b1530] text-gray-300"
    >
      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2">
            <img src={assets.logo} alt="RecruitAI" className="w-12 h-12" />
            <h3 className="text-white text-2xl font-bold">RecruitAI</h3>
          </div>
          <p className="text-sm text-gray-400 mt-2 max-w-xs">
            AI-driven resume screening & smart shortlisting — hire faster,
            fairer, smarter.
          </p>

          <div className="text-sm text-gray-400 space-y-2 mt-4">
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-indigo-400" /> info@recruitai.com
            </div>
            <div className="flex items-center gap-2">
              <FaPhone className="text-green-400" /> +92 300 123 4567
            </div>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-400" /> Karachi, Pakistan
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {["home", "about", "features", "contact"].map((section) => (
              <li key={section}>
                <button
                  onClick={() => scrollToSection(section)}
                  className="hover:text-white transition"
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              </li>
            ))}
            <li>
              <a href="/login" className="hover:text-white transition">
                Login
              </a>
            </li>
            <li>
              <a href="/adminlogin" className="hover:text-white transition">
                Admin Panel
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-white font-semibold mb-3">Newsletter</h4>
          <p className="text-sm text-gray-400 mb-3">
            Get product updates, hiring tips and AI insights.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Subscribed! (Backend hook goes here)");
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-3 py-2 text-sm rounded-md bg-[#071026] border border-white/10 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-indigo-600 rounded-md hover:bg-indigo-700 transition text-white"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Social Icons */}
        <div>
          <h4 className="text-white font-semibold mb-3">Follow Us</h4>
          <div className="flex flex-wrap gap-3 text-lg">
            <a
              href="#"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-blue-500 transition text-white"
            >
              <FaFacebook />
            </a>
            <a
              href="#"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-sky-400 transition text-white"
            >
              <FaTwitter />
            </a>
            <a
              href="#"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-pink-500 transition text-white"
            >
              <FaInstagram />
            </a>
            <a
              href="#"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-blue-600 transition text-white"
            >
              <FaLinkedin />
            </a>
            <a
              href="#"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-gray-400 transition text-white"
            >
              <FaGithub />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 mt-8 py-4 text-center text-xs sm:text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          © {new Date().getFullYear()} <b>RecruitAI</b>. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
