import { useEffect, useState } from "react";
import { scrollToSection } from "../utils/scroll";
import { FaBars, FaTimes } from "react-icons/fa";
import { assets } from "../assets/assets.js";

const Navbar = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isOpen, setIsOpen] = useState(false); // ✅ for mobile menu

  // Reset scroll on refresh
  useEffect(() => {
    window.history.replaceState(null, null, " ");
    window.scrollTo(0, 0);
  }, []);

  // Track active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "features", "contact"];
      let current = "home";

      sections.forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            current = id;
          }
        }
      });

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (id) => {
    scrollToSection(id);
    setIsOpen(false); // ✅ close mobile menu after click
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 pt-4">
      <div className="text-white flex items-center justify-between px-6 py-2 rounded-full shadow-lg border border-white/10 bg-[#0f1d3d]/80 backdrop-blur-md">
        {/* Logo Section */}
        <div
          className="logo flex items-center  cursor-pointer"
          onClick={() => handleClick("home")}
        >
          <img
            src={assets.logo}
            alt="Main Logo"
            className="w-12 h-12 object-contain rounded-full "
          />
          <h1 className="font-bold text-xl tracking-wide text-white">
            RecruitAI
          </h1>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex nav-links">
          <ul className="flex gap-3 md:gap-6">
            {["home", "about", "features", "contact"].map((id) => (
              <li
                key={id}
                onClick={() => handleClick(id)}
                className={`px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-200 ${
                  activeSection === id
                    ? "bg-indigo-600 shadow-lg text-white"
                    : "hover:bg-white/10 hover:shadow"
                }`}
              >
                {id === "home"
                  ? "Home"
                  : id.charAt(0).toUpperCase() + id.slice(1)}
              </li>
            ))}
          </ul>
        </div>

        {/* Login Btn (Desktop Only) */}
        <div className="hidden md:block">
          <a href="/login">
            <button className="px-5 py-1.5 rounded-full bg-white text-black border border-white/20 shadow-sm hover:bg-gradient-to-r from-[#0a0f1c] via-[#0f1d3d] to-[#0a0f1c] hover:text-white hover:border hover:shadow-md transition-all duration-300 text-sm sm:text-base">
              Login
            </button>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div
          className="md:hidden text-2xl cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden mt-2 px-6">
          <ul className="flex flex-col gap-4 bg-[#0f1d3d]/95 text-white rounded-lg p-6 shadow-lg">
            {["home", "about", "features", "contact"].map((id) => (
              <li
                key={id}
                onClick={() => handleClick(id)}
                className={`cursor-pointer px-3 py-2 rounded-lg text-center ${
                  activeSection === id
                    ? "bg-indigo-400 text-white"
                    : "hover:bg-white/10"
                }`}
              >
                {id === "home"
                  ? "Home"
                  : id.charAt(0).toUpperCase() + id.slice(1)}
              </li>
            ))}

            {/* Login Btn (Mobile) */}
            <li>
              <a href="/login">
                <button className="w-full px-5 py-2 rounded-lg bg-white text-black border border-white/20 shadow-sm hover:bg-transparent hover:text-white hover:border-white/40 hover:shadow-lg transition-all duration-300">
                  Login
                </button>
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
