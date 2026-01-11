import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Shortlisted = () => {
  const { jobId } = useParams();

  const [shortlisted, setShortlisted] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    const fetchFromDB = async () => {
      const userEmail = localStorage.getItem("userEmail");

      try {
        const res = await fetch(
          `http://127.0.0.1:8000/shortlisted-db/${jobId}?userEmail=${userEmail}`
        );

        const data = await res.json();
        setShortlisted(data.shortlisted || []);
        setJobTitle(data.jobTitle || "");
      } catch (error) {
        console.error("Failed to fetch shortlisted candidates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFromDB();
  }, [jobId]);

    // Export all shortlisted candidates to Excel
  const exportToExcel = () => {
    const dataForExcel = shortlisted.map((c, index) => ({
      Rank: index + 1,
      Name: c.name,
      Email: c.email || "N/A",
      "Match Score (%)": Math.round(c.match_score || 0),
      "Resume Link": c.resume_path ? `http://127.0.0.1:8000${c.resume_path}` : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shortlisted Candidates");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Shortlisted_${jobTitle}.xlsx`);
  };


  if (loading) {
    return (
      <Layout>
        <p className="text-center mt-10">Loading shortlisted candidates...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold mb-2">Shortlisted Candidates</h1>

        <p className="text-gray-500 mb-6">
          Top candidates for{" "}
          <strong className="text-green-500">{jobTitle}</strong>
        </p>

        {/* Candidates List */}
        <div className="w-full">
          {shortlisted.length === 0 && (
            <p className="text-gray-500">No candidates shortlisted.</p>
          )}

          {shortlisted.map((c, index) => (
            <div key={index} className="mb-4 flex gap-4 items-center">
              <ul className="w-[320px] rounded-md flex justify-between items-center border p-3 bg-white">
                <li className="font-medium">
                  #{index + 1} {c.name}
                </li>
                <span className="text-sm text-green-600 font-semibold">
                  {Math.round(c.match_score || 0)}%
                </span>
              </ul>

              <button
                onClick={() =>
                  setSelectedCandidate({
                    ...c,
                    rank: index + 1,
                  })
                }
                className="text-sm border rounded-full px-4 py-1 bg-blue-500 text-white hover:bg-blue-600 transition duration-300"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>

        {/* Export Button */}
        <div className="mt-6">
          <button onClick={exportToExcel} className="border text-sm px-4 py-2 bg-green-500 rounded-lg text-white font-semibold hover:bg-green-600 transition duration-300">
            Export to Sheets
          </button>
        </div>
      </div>

      {/* ================= POPUP MODAL ================= */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[420px] relative">

            {/* Close Button */}
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-2 right-3 text-2xl font-bold text-gray-500 hover:text-black"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-4">
              Candidate Details
            </h2>

            <div className="space-y-2 text-sm">
              <p><strong>Rank:</strong> #{selectedCandidate.rank}</p>
              <p><strong>Name:</strong> {selectedCandidate.name}</p>
              <p>
                <strong>Email:</strong>{" "}
                {selectedCandidate.email || "Not available"}
              </p>
              <p>
                <strong>Match Score:</strong>{" "}
                {Math.round(selectedCandidate.match_score || 0)}%
              </p>
            </div>

            <a
              href={`http://127.0.0.1:8000${selectedCandidate.resume_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-blue-600 underline text-sm"
            >
              View Resume
            </a>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Shortlisted;
