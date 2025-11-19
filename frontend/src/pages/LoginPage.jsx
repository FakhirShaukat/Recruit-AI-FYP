import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { jwtDecode } from "jwt-decode";
const GOOGLE_CLIENT_ID =
  "134701297987-4td0r98bqr8gukvm5qghb8ljp8tt7573.apps.googleusercontent.com";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const navigate = useNavigate();

  const checkUser = () => {
    if (username === "admin" && password === "admin123") {
      navigate("/dashboard");
    } else {
      setError(true);
    }
  };

  //     // Manual login
  // const checkUser = async () => {
  //   try {
  //     const res = await fetch("http://localhost:5000/api/auth/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         name: username,
  //         email: `${username}@company.com`,
  //       }),
  //     });

  //     const data = await res.json();

  //     if (res.ok) {
  //       localStorage.setItem("user", JSON.stringify(data.user));
  //       localStorage.setItem("token", data.token);
  //       alert("Login successful!");
  //       navigate("/dashboard");
  //     } else {
  //       alert(data.error || "Login failed");
  //     }
  //   } catch (err) {
  //     console.error("Manual login error:", err);
  //     alert("Server error");
  //   }
  // };
  //     // Initials helpers
  //     const getInitialsFromName = (name) => {
  //         if (!name) return "";
  //         const parts = name.split(" ");
  //         return parts.map(word => word[0].toUpperCase()).join("").slice(0, 2);
  //     };

  //     const getInitialsFromEmail = (email) => {
  //         if (!email) return "";
  //         return email.charAt(0).toUpperCase();
  //     };

  // Google Sign-In
  useEffect(() => {
    /* global google */
    const handleCredentialResponse = async (response) => {
      try {
        // Send Google token to backend
        console.log("Google raw token:", response.credential);
        const res = await fetch("http://localhost:5000/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: response.credential }),
        });

        const data = await res.json();
        console.log("Backend response:", data);

        if (res.ok) {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("token", data.token); // Save token for API calls
          alert(`Welcome ${data.user.name}`);
          navigate("/dashboard");
        } else {
          alert("Google login failed");
        }
      } catch (err) {
        console.error("Google login error:", err);
      }
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      const container = document.getElementById("google-login-btn");
      const containerWidth = container
        ? Math.floor(container.clientWidth)
        : 320;
      const buttonWidth = Math.max(260, Math.min(containerWidth, 480));

      google.accounts.id.renderButton(container, {
        type: "standard",
        theme: "filled_white",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
        width: buttonWidth,
      });
    };
  }, [navigate]);

  return (
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
          <p className="text-slate-300 text-sm mt-1">
            Welcome back. Please sign in to continue.
          </p>

          {/* Manual Login */}
          <div className="inputs w-full flex flex-col gap-4 mt-6">
            {/* Username Input */}
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
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-white placeholder:text-slate-300/70 focus:outline-none focus:ring-2 transition 
      ${
        error
          ? "bg-red-500/10 border-red-400 placeholder:text-red-400 focus:ring-red-400"
          : "bg-white/10 border-white/20 focus:ring-indigo-400/60 focus:border-transparent"
      }`}
                type="text"
                placeholder="Enter username"
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkUser()}
              />
            </div>

            {/* Password Input */}
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
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-white placeholder:text-slate-300/70 focus:outline-none focus:ring-2 transition 
      ${
        error
          ? "bg-red-500/10 border-red-400 placeholder:text-red-400 focus:ring-red-400"
          : "bg-white/10 border-white/20 focus:ring-indigo-400/60 focus:border-transparent"
      }`}
                type="password"
                placeholder="Enter password"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkUser()}
              />
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-400 text-sm text-center mt-1">
                Invalid username/email or password
              </p>
            )}

            {/* Login Button */}
            <button
              className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-purple-400 hover:shadow-indigo-400/30 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400/60 transition duration-200"
              onClick={checkUser}
            >
              Login
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center w-full my-6">
            <div className="h-px bg-white/20 flex-1"></div>
            <span className="text-slate-300 text-sm mx-3">OR</span>
            <div className="h-px bg-white/20 flex-1"></div>
          </div>

          {/* Google Sign In */}
          <div
            id="google-login-btn"
            className="w-full flex justify-center"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
