import React, { useState, useEffect } from "react";
import Layout from "./Layout.jsx";

const PreviousRankings = () => {
  const [results, setResults] = useState([]);
  const [openJob, setOpenJob] = useState(null);
  const [openRow, setOpenRow] = useState(null);

  // Toggle job expand/collapse
  const toggleJob = (index) => {
    setOpenJob(openJob === index ? null : index);
    setOpenRow(null); // reset candidate rows when changing job
  };

  // Toggle candidate row expand/collapse
  const toggleRow = (index) => {
    setOpenRow(openRow === index ? null : index);
  };

  // Fetch previous rankings from backend
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    fetch(`http://localhost:8000/previous-rankings?userEmail=${userEmail}`)
      .then((res) => res.json())
      .then((data) => setResults(data))
      .catch((err) => console.error(err));
  }, []);

  // Remove entire ranking
  const handleRemoveRanking = async (jobId) => {
    const userEmail = localStorage.getItem("userEmail");
    if (!window.confirm("Are you sure you want to delete this entire ranking?"))
      return;

    try {
      const res = await fetch(
        `http://localhost:8000/remove-ranking/${jobId}?userEmail=${userEmail}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to remove ranking");

      // Update UI
      setResults((prev) => prev.filter((job) => job._id !== jobId));
    } catch (err) {
      console.error(err);
      alert("Error deleting ranking");
    }
  };

  return (
    <Layout>
      <div >
        <h1 className="text-3xl font-bold mb-6">Previous Ranking Results</h1>

        {results.length === 0 ? (
          <p className="text-center text-gray-500">
            No previous rankings found...
          </p>
        ) : (
          results.map((job, jobIndex) => (
            <div
              key={jobIndex}
              className="mb-4 bg-white max-w-[80%]  p-2 rounded-md border border-gray-300"
            >
              {/* Job Header */}
              <div
                className="flex font-inter justify-between items-center cursor-pointer"
                onClick={() => toggleJob(jobIndex)}
              >
                <h2 className=" ">{job.jobTitle}</h2>
                <button className="text-sm text-blue-500">
                  {openJob === jobIndex ? "Collapse" : "Expand"}
                </button>
              </div>

              {/* Job Details */}
              {openJob === jobIndex && (
                <>
                  <div className="my-3">
                    <p>
                      <strong>Total Applicants:</strong> {job.resumes.length}
                    </p>
                    <p>
                      <strong>Resume Screened:</strong>{" "}
                      {job.resumes.filter((r) => r.match_score >= 0).length}
                    </p>
                  </div>

                  {/* Candidates Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-400 text-white">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Candidate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Match Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Resume
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-200">
                        {job.resumes.map((r, index) => {
                          const scorePercent = r.match_score
                            ? Math.round(r.match_score)
                            : 0;
                          let scoreColor = "bg-gray-300";
                          if (scorePercent >= 70) scoreColor = "bg-green-500";
                          else if (scorePercent >= 50) scoreColor = "bg-yellow-500";
                          else scoreColor = "bg-red-500";

                          return (
                            <React.Fragment key={index}>
                              <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4">{index + 1}</td>
                                <td className="px-6 py-4">{r.name}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                      <div
                                        className={`${scoreColor} h-2 rounded-full`}
                                        style={{ width: `${scorePercent}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-semibold">
                                      {scorePercent}%
                                    </span>
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
                                      <p className="text-gray-700 mb-1">
                                        <strong>Skills Match:</strong>{" "}
                                        {Math.round(r.skills?.score * 100 || 0)}%
                                      </p>
                                      <p className="text-gray-700 mb-1">
                                        <strong>Education Match:</strong>{" "}
                                        {r.education?.label || "N/A"}
                                      </p>
                                      <p className="text-gray-700">
                                        <strong>Experience Match:</strong>{" "}
                                        {r.experience?.label || "N/A"}
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>

                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => handleRemoveRanking(job._id)}
                        className="border p-2 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default PreviousRankings;
