import React from "react";

const PageLoader = () => {
  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center bg-[#0a0f1c]/95 backdrop-blur-lg z-50">
      {/* Outer Glowing Gradient Ring */}
      <div className="relative flex justify-center items-center">
        {/* Glowing Aura */}
        <div className="absolute w-40 h-40 bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-400 opacity-30 blur-3xl animate-pulse"></div>

        {/* Main Spinning Ring */}
        <div className="relative w-28 h-28 border-[6px] border-transparent border-t-indigo-500 border-r-blue-400 rounded-full animate-spin"></div>

        {/* Inner Pulse Core */}
        <div className="absolute w-6 h-6 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full blur-sm animate-ping"></div>
      </div>

      {/* Text */}
      <p className="mt-8 text-base font-medium text-gray-300 tracking-wide">
        Powering Recruit<span className="text-indigo-400">AI</span>
        <span className="animate-pulse">...</span>
      </p>
    </div>
  );
};

export default PageLoader;
