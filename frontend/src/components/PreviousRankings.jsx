import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets.js";
import Layout from "./Layout.jsx";

const PreviousRankings = () => {
  const [results, setResults] = useState([]); // Array of job results
  const [openJob, setOpenJob] = useState(null); // Track expanded job
  const [openRow, setOpenRow] = useState(null); // Track expanded candidate row

  const toggleJob = (index) => {
    setOpenJob(openJob === index ? null : index);
    setOpenRow(null); // reset candidate rows when changing job
  };

  const toggleRow = (index) => {
    setOpenRow(openRow === index ? null : index);
  };

  // Fetch previous rankings from backend
  useEffect(() => {
    fetch("http://localhost:8000/previous-rankings")
      .then((res) => res.json())
      .then((data) => setResults(data))
      .catch((err) => console.error("Failed to fetch previous rankings:", err));
  }, []);
  const handleRemoveCandidate = async (jobId, candidateName) => {
  if (!window.confirm(`Are you sure you want to remove ${candidateName}?`)) return;

  try {
    const res = await fetch(`http://localhost:8000/remove-candidate/${jobId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateName }),
    });

    if (!res.ok) throw new Error("Failed to remove candidate");

    // Update frontend state
    setResults(prevResults =>
      prevResults.map(job =>
        job._id === jobId
          ? { ...job, resumes: job.resumes.filter(r => r.name !== candidateName) }
          : job
      )
    );
  } catch (err) {
    console.error(err);
    alert("Error removing candidate");
  }
};


  if (!results.length) return <p className="text-center mt-6">No previous rankings found.</p>;

  return (
    <Layout>
        <div>
      <h1 className="text-2xl font-bold mb-4">Previous Ranking Results</h1>

      {results.map((job, jobIndex) => (
        <div key={jobIndex} className="mb-6 bg-white p-4 rounded-xl shadow-md border border-gray-100">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleJob(jobIndex)}
          >
            <h2 className="text-xl font-light font-inter">{job.jobTitle}</h2>
            <button className="text-sm text-blue-500">{openJob === jobIndex ? "Collapse" : "Expand"}</button>
          </div>

          {openJob === jobIndex && (
            <>
              <div className="details my-4">
                <p className="font-bold">Total Applicants: <span className="font-normal">{job.resumes.length}</span> </p>
                <p className="font-bold">Resume Screen: <span className="font-normal">{job.resumes.filter(r => r.match_score >= 0).length}</span> </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-400 text-white">
                    <tr className="font-inter">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Candidate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Match Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Resume</th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {job.resumes.map((r, index) => {
                      const scorePercent = r.match_score ? Math.round(r.match_score) : 0;
                      let scoreColor = "bg-gray-300";
                      if (scorePercent >= 70) scoreColor = "bg-green-500";
                      else if (scorePercent >= 50) scoreColor = "bg-yellow-500";
                      else scoreColor = "bg-red-500";

                      return (
                        <React.Fragment key={index}>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-inter">{index + 1}</td>
                            <td className="px-6 py-4 font-inter">{r.name}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                  <div className={`${scoreColor} h-2 rounded-full`} style={{ width: `${scorePercent}%` }}></div>
                                </div>
                                <span className="text-sm font-semibold">{scorePercent}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500">Resume.pdf</td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => toggleRow(index)}
                                className="text-white bg-green-500 hover:bg-green-600 py-1 px-3 rounded-full text-xs"
                              >
                                {openRow === index ? "Collapse" : "View Details"}
                              </button>
                            </td>
                          </tr>

                          {openRow === index && (
                            <tr>
                              <td colSpan="5" className="bg-gray-50 px-6 py-4">
                                <div className="transition-all duration-500 ease-in-out overflow-hidden">
                                  <p className="text-gray-700 mb-2"><strong>Skills Match:</strong> {Math.round(r.skills?.score * 100 || 0)}%</p>
                                  <p className="text-gray-700 mb-2"><strong>Education Match:</strong> {r.education?.label || "N/A"}</p>
                                  <p className="text-gray-700"><strong>Experience Match:</strong> {r.experience?.label || "N/A"}</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    
                  </tbody>
                </table>

              </div>
            </>
          )}
        </div>
      ))}
      </div>
      </Layout>
  );
};

export default PreviousRankings;
