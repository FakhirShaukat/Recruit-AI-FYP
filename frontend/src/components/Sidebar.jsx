import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const sidebarLinks = [
    { label: "Dashboard", icons: assets.homeicon, path: "/dashboard" },
    { label: "Job Listings", icons: assets.list, path: "/addjobs" },
    { label: "Resume Screening", icons: assets.ai, path: "/screening" },
    { label: "Ranked Candidates", icons: assets.rank, path: "/ranking" },
  ];

  return (
    <div className="sidebar w-[200px] fixed h-screen flex flex-col border border-black bg-gradient-to-b from-[#0a0f1c] via-[#0f1d3d] to-[#0a0f1c]">
      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto">
        <div className="logo flex items-center text-white p-4 gap-2 cursor-pointer">
          <img src={assets.logo} alt="RecruitAI Logo" className="w-8 h-9" />
          <h1 className="text-xl font-bold">RecruitAI</h1>
        </div>

        <div className="sidebar-navlinks space-y-4 mt-5">
          {sidebarLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className="links text-white flex items-center w-full gap-3 p-2 px-5 hover:bg-white/10 rounded-lg cursor-pointer"
            >
              <img className="w-4 invert" src={link.icons} alt={link.label} />
              <p className="text-sm">{link.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
