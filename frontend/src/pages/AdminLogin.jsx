import React, { useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await res.json();
      localStorage.setItem("adminToken", data.token); // store JWT
      alert("Login Successful ");
      navigate("/adminpanel"); // redirect after login
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div>
      <div className="login-container relative min-h-screen overflow-hidden bg-gradient-to-r from-[#0a0f1c] via-[#0f1d3d] to-[#0a0f1c] ">
        {/* Decorative blurred sides */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-56 h-56 md:w-72 md:h-72 bg-indigo-500/20 blur-3xl rounded-full"></div>
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-56 h-56 md:w-72 md:h-72 bg-purple-500/20 blur-3xl rounded-full"></div>

        <div className="Back-Btn absolute top-4 left-4 p-3 md:p-4 z-30">
          <button
            aria-label="Back"
            onClick={() => navigate(-1)}
            className="group w-10 h-10 md:w-11 md:h-11 grid place-items-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm shadow-md shadow-black/30 hover:bg-white/10 hover:shadow-indigo-500/20 transition duration-200 ease-out ring-1 ring-white/10 hover:ring-indigo-400/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/70 active:scale-95"
          >
            <img
              className="w-4 invert transition-transform duration-200 group-hover:-translate-x-0.5"
              src={assets.arrow}
              alt="Back"
            />
          </button>
        </div>

        <div className="form relative z-10 grid min-h-screen place-items-center px-4">
          <div className="form-content w-full max-w-[380px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl flex flex-col items-center p-6 md:p-8">
            <h1 className="text-center mt-1 text-[34px] md:text-[40px] font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
              Login
            </h1>
            {error && (
              <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
            )}

            {/* Login Inputs */}
            <div className="inputs w-full flex flex-col gap-4 mt-6">
              <div className="relative w-full">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300/70">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 10a4 4 0 100-8 4 4 0 000 8z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 16.042A8 8 0 0115.542 16.042a1 1 0 01-.832 1.495H1.29a1 1 0 01-.832-1.495z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent transition"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="relative w-full">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300/70">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 8a5 5 0 1110 0v2h1a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2h1V8zm2 2V8a3 3 0 016 0v2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent transition"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-purple-400 hover:shadow-indigo-400/30 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400/60 transition duration-200"
                onClick={handleLogin}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
