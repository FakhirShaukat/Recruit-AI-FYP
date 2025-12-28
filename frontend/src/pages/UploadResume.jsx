import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useParams } from "react-router-dom";
import axios from "axios";
import PageLoader from "../components/PageLoader";
import briefcase from "../assets/briefcase.png";
import { CheckCircle } from "lucide-react";


const UploadResume = () => {
  const { jobId } = useParams(); // capture jobId from URL

  const [showForm, setShowForm] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [applied, setApplied] = useState(false);



  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    resume: null,
  });

  const isMock = true;

  useEffect(() => {
    const alreadyApplied = localStorage.getItem(`applied_${jobId}`);
    if (alreadyApplied) {
      setApplied(true);
    }
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

  // Handle form change
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
      alert("Please upload your resume!");
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

      setShowSuccess(true);
      localStorage.setItem(`applied_${jobId}`, true);
      setApplied(true);

      setTimeout(() => {
        setShowSuccess(false);
        setShowForm(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 2000);

      localStorage.setItem(`applied_${jobId}`, true);
      setApplied(true);


      setFormData({
        name: "",
        email: "",
        phone: "",
        resume: null,
      });

    } catch (error) {
      console.error("Error uploading resume:", error);
      alert("Failed to submit resume. Please try again.");
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0f1c] via-[#0f1d3d] to-[#0a0f1c] text-white flex flex-col">
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white/10 border border-white/20 rounded-xl p-6 text-center shadow-xl">
            <CheckCircle size={48} className="mx-auto text-green-400 mb-3" />
            <p className="text-lg font-medium text-white">Resume submitted successfully</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 py-5 px-5">
        <img src={assets.logo} alt="Logo" className="w-11 h-12" />
        <h1 className="text-2xl font-bold text-white tracking-wide">
          Recruit<span className="text-indigo-400">AI</span>
        </h1>
      </div>

      {/* Job Details or Form */}
      {!job ? (
        <div className="flex flex-1 items-center justify-center text-red-400 text-lg">
          No job found! Invalid or missing link.
        </div>
      ) : !showForm ? (
        <div className="flex flex-col justify-start px-6 sm:px-10 md:px-16 lg:px-28 py-10">
          {/* Job Header */}
          <div className="flex items-center gap-3 mb-10">
            <img
              src={briefcase}
              alt="Upload Icon"
              className="w-8 sm:w-10 invert opacity-100"
            />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white leading-tight">
              {job.title}
            </h2>
          </div>

          {/* Overview */}
          <div className="mb-8 max-w-4xl">
            <h3 className="text-base sm:text-lg font-semibold text-indigo-400 mb-3">
              Overview
            </h3>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
              {job.description}
            </p>
          </div>

          {/* Skills */}
          {job.skills && (
            <div className="mb-8 max-w-4xl">
              <h3 className="text-base sm:text-lg font-semibold text-indigo-400 mb-3">
                Skills Required
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {job.skills.split(",").map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-sm sm:text-base font-medium hover:bg-indigo-500/30 transition duration-300"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Details */}
          <div className="flex flex-col gap-3 sm:gap-4 text-gray-300 text-sm sm:text-base mb-10 max-w-4xl">
            {job.education && (
              <p>
                <span className="text-indigo-400 font-medium">Education:</span>{" "}
                {job.education}
              </p>
            )}
            {job.experience && (
              <p>
                <span className="text-indigo-400 font-medium">Experience:</span>{" "}
                {job.experience}
              </p>
            )}
            {job.salaryExpectation && (
              <p>
                <span className="text-indigo-400 font-medium">Salary:</span> PKR{" "}
                {job.salaryExpectation}/month
              </p>
            )}
            {job.jobType && (
              <p>
                <span className="text-indigo-400 font-medium">Job Type:</span>{" "}
                {job.jobType}
              </p>
            )}
            {job.location && (
              <p>
                <span className="text-indigo-400 font-medium">Location:</span>{" "}
                {job.location}
              </p>
            )}
          </div>

          {/* Apply Button */}
          <button
            onClick={() => {
              if (!applied) {
                setShowForm(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            disabled={applied}
            className={`px-7 py-3 rounded-full text-sm font-medium transition duration-300 w-fit
    ${applied
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500/30"
              }
  `}
          >
            {applied ? "Already Applied" : "Apply Now"}
          </button>

        </div>
      ) : (
        <div className="flex flex-col justify-start px-6 sm:px-10 md:px-16 lg:px-28 py-10">
          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
              Upload Your Resume
            </h2>
            <p className="text-gray-400 text-sm">
              Applying for:{" "}
              <strong className="text-indigo-400">{job.title}</strong>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4 max-w-xl" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm mb-1 text-gray-200">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2.5 text-sm rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-200">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2.5 text-sm rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-200">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full p-2.5 text-sm rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                placeholder="03xx-xxxxxxx"
              />
            </div>

            <div className="border-2 border-dashed border-indigo-400 bg-white/5 mt-5 flex flex-col justify-center items-center h-[140px] rounded-lg text-sm text-gray-300 hover:bg-white/10 transition-all duration-300 cursor-pointer">
              <p className="text-center">Drag and drop or click to upload</p>
              <p className="text-xs text-gray-400 mt-1">
                Supported: PDF, DOCX
              </p>
              <input
                type="file"
                name="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleChange}
                className="mt-3 text-xs text-gray-300 cursor-pointer"
                required
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-md bg-indigo-600 text-white font-medium text-sm transition duration-300 hover:bg-indigo-500/30"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-indigo-400 text-indigo-300 rounded-md hover:bg-indigo-500/10 transition duration-200 text-sm font-medium"
              >
                Back to Job Description
              </button>
            </div>
          </form>

          {/* Footer */}
          <footer className="w-full text-gray-400 text-xs sm:text-sm italic flex justify-center items-center text-center pb-6 mt-16">
            <p>
              Powered by{" "}
              <span className="text-indigo-400 font-semibold">RecruitAI</span>
            </p>
          </footer>
        </div>
      )}
    </div>
  );
};

export default UploadResume;
