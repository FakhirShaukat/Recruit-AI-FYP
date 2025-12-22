import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useParams } from "react-router-dom";
import axios from "axios";
import PageLoader from "../components/PageLoader";
import briefcase from "../assets/briefcase.png";
import { CheckCircle, AlertTriangle } from "lucide-react"; // NEW: icons for popups

const UploadResume = () => {
  const { jobId } = useParams();
  const [showForm, setShowForm] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    resume: null,
  });

  const [showSuccess, setShowSuccess] = useState(false); // NEW: success popup
  const [showError, setShowError] = useState(false); // NEW: validation popup
  const [applied, setApplied] = useState(false); // NEW: restrict re-apply

  useEffect(() => {
    const alreadyApplied = localStorage.getItem(`applied_${jobId}`); // NEW: check local restriction
    if (alreadyApplied) setApplied(true);
  }, [jobId]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/jobs/public/${jobId}`
        );
        setJob(res.data);
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleChange = (e) => {
    if (e.target.name === "resume") {
      setFormData({ ...formData, resume: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.resume) {
      setShowError(true); // NEW: show validation popup
      setTimeout(() => setShowError(false), 2000); // NEW: auto hide popup
      return;
    }

    const data = new FormData();
    data.append("jobId", job._id);
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("resume", formData.resume);

    try {
      await axios.post("http://localhost:5000/api/candidate", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowSuccess(true); // NEW: show success popup
      localStorage.setItem(`applied_${jobId}`, true); // NEW: save apply restriction
      setApplied(true); // NEW: disable re-apply

      setTimeout(() => {
        setShowSuccess(false);
        setShowForm(false); // NEW: go back to Apply Now section
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 2000);

      setFormData({ name: "", email: "", phone: "", resume: null });
    } catch (error) {
      console.error("Error uploading resume:", error);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0f1c] via-[#0f1d3d] to-[#0a0f1c] text-white flex flex-col">

      {/* SUCCESS POPUP */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white/10 border border-white/20 rounded-xl p-6 text-center shadow-xl">
            <CheckCircle size={48} className="mx-auto text-green-400 mb-3" />
            <p className="text-lg font-medium">
              Resume uploaded successfully
            </p>
          </div>
        </div>
      )}

      {/* ERROR POPUP */}
      {showError && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white/10 border border-white/20 rounded-xl p-6 text-center shadow-xl">
            <AlertTriangle size={48} className="mx-auto text-red-400 mb-3" />
            <p className="text-lg font-medium">
              Please upload PDF or DOCX file
            </p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center gap-2 py-5 px-5">
        <img src={assets.logo} alt="Logo" className="w-11 h-12" />
        <h1 className="text-2xl font-bold">
          Recruit<span className="text-indigo-400">AI</span>
        </h1>
      </div>

      {!job ? (
        <div className="flex flex-1 items-center justify-center text-red-400">
          No job found! Invalid or missing link.
        </div>
      ) : !showForm ? (
        <div className="flex flex-col justify-start px-6 sm:px-10 md:px-16 lg:px-28 py-10">
          <div className="flex items-center gap-3 mb-10">
            <img
              src={briefcase}
              alt="Upload Icon"
              className="w-8 sm:w-10 invert"
            />
            <h2 className="text-3xl font-semibold">{job.title}</h2>
          </div>

          <button
            onClick={() => !applied && setShowForm(true)} // NEW: prevent click if applied
            disabled={applied} // NEW: disable button
            className={`px-7 py-3 rounded-full text-sm w-fit transition ${
              applied
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500/30"
            }`}
          >
            {applied ? "Already Applied" : "Apply Now"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col justify-start px-6 sm:px-10 md:px-16 lg:px-28 py-10">
          <form className="space-y-4 max-w-xl" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Full Name"
              className="w-full p-2.5 rounded-md bg-white/10"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email"
              className="w-full p-2.5 rounded-md bg-white/10"
            />

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Phone Number"
              className="w-full p-2.5 rounded-md bg-white/10"
            />

            <input
              type="file"
              name="resume"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
              className="text-sm"
            />

            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 rounded-md text-sm"
            >
              Submit Application
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UploadResume;