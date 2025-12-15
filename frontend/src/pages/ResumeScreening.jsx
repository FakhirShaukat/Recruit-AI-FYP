import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import Layout from "../components/Layout";
import ModelLoader from "../components/ModelLoader";

const ResumeScreening = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const toggleJob = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    const token = localStorage.getItem("token"); 

    const fetchJobsWithResumes = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch jobs");
        const jobsData = await res.json();

        const jobsWithResumes = await Promise.all(
          jobsData.map(async (job) => {
            try {
              const resumesRes = await fetch(
                `http://localhost:5000/api/candidate/job/${job._id}`
              );

              const resumes = resumesRes.ok ? await resumesRes.json() : [];

              return {
                title: job.title,
                _id: job._id,
                resumes: resumes.map((r) => ({
                  file: r.resume.split("\\").pop(), 
                  id: r._id,
                })),
              };
            } catch {
              return { title: job.title, _id: job._id, resumes: [] };
            }
          })
        );

        setJobs(jobsWithResumes);
      } catch (err) {
        console.error("❌ Error fetching jobs or resumes:", err);
      }
    };

    fetchJobsWithResumes();
  }, []);

  const screenAllResumes = async (jobId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/run-pipeline/${jobId}`);
      const data = await response.json();

      if (data.resumes) {
        localStorage.setItem("screeningResults", JSON.stringify(data.resumes));
        setTimeout(() => {
          setLoading(false);
         navigate(`/ranking/${jobId}`);
        }, 1500);
      } else {
        setLoading(false);
        alert("No results returned from the pipeline");
      }
    } catch (err) {
      console.error("Error running pipeline:", err);
      setLoading(false);
      alert("Error running the resume screening pipeline");
    }
  };


  return (
    <Layout showSearch={false}>
      <div className="content  h-full">
        <div className="heading mb-4">
          <h1 className="text-3xl font-bold ">Resume Screening</h1>
        </div>

        <div className="applied-section  max-w-[80%]">
          <h1 className="mb-2 font-inter p-1 pl-2 text-md bg-gradient-to-b text-white from-[#0a0f1c] via-[#0f1d3d] to-[#0a0f1c] border rounded-md">Applied Resumes</h1>
          <div className="jobs-section flex flex-col gap-2 ">
            {jobs.length === 0 ? (
              <p className="text-gray-500 text-sm ml-2">No jobs added yet.</p>
            ) : (
              jobs.map((job, index) => (
                <div
                  key={index}
                  className="job border rounded-lg h-auto flex flex-col p-2 shadow-md"
                >
                  {/* Job Header */}
                  <div
                    className="job-header flex justify-between items-center cursor-pointer"
                    onClick={() => toggleJob(index)}
                  >
                    <h2 className="">{job.title}</h2>
                    <img
                      className={`w-6 transition-transform duration-300 ${openIndex === index ? "rotate-180" : "rotate-0"
                        }`}
                      src={assets.dropdown}
                      alt="toggle"
                    />
                  </div>

                  {/* Expandable Section */}
                  {openIndex === index && (
                    <div className="resumes mt-2 flex flex-col gap-2 border-t pt-2">
                      {job.resumes.length === 0 ? (
                        <p className="text-gray-400 text-sm">
                          No resumes uploaded yet.
                        </p>
                      ) : (
                        <div className="w-full">
                          {/* Header Row */}
                          <div className="flex text-sm font-semibold border-b pb-1">
                            <p className="w-1/4 text-gray-800">ID</p>
                            <p className="w-3/4 text-gray-800">Resume</p>
                          </div>

                          {/* Resume Rows */}
                          {job.resumes.map((resume, i) => (
                            <div
                              key={i}
                              className="flex items-center text-sm border-b py-1"
                            >
                              <p className="w-1/4 text-gray-600">{i + 1}</p>
                              <a
                                href={`http://localhost:5000/uploads/${resume.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-3/4 text-blue-600 hover:underline truncate"
                              >
                                {resume.file}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Screen All Button */}
                      <div className="mt-3 flex justify-end">
                        <button onClick={() => screenAllResumes (job._id)} className="text-xs border px-3 py-1 rounded-xl bg-red-500 hover:bg-red-700 text-white">
                          Screen All
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <ModelLoader show={loading} />

      </div>
    </Layout>
  );
};

export default ResumeScreening;
