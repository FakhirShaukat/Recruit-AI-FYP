import React, { useState, useEffect, useContext } from "react";
import { SearchContext } from "../contexts/SearchContext";
import Layout from "../components/Layout";
import { assets } from "../assets/assets";

const AddJobs = () => {
  const { searchText } = useContext(SearchContext);
  const [jobs, setJobs] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    requirements: "",
    skills: "",
    education: "",
    experience: "",
    salaryexpectation: "",
    jobtype: "",
    location: ""
  });
  const [editIndex, setEditIndex] = useState(null);

  // Get JWT token from localStorage
  const token = localStorage.getItem("token");

  // Fetch jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/jobs", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };

    fetchJobs();
  }, [token]);

  // Handle input change
  const handleChange = (e) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  // Save job (Add / Update)
  const handleSaveJob = async () => {
    if (!newJob.title || !newJob.description) {
      alert("Please fill in at least the title and description.");
      return;
    }

    try {
      let res;

      if (editIndex !== null) {
        // Update job
        res = await fetch(`http://localhost:5000/api/jobs/${jobs[editIndex]._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(newJob),
        });
      } else {
        // Add new job
        res = await fetch("http://localhost:5000/api/jobs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(newJob),
        });
      }

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save job");

      if (editIndex !== null) {
        const updatedJobs = [...jobs];
        updatedJobs[editIndex] = data; // updated job from DB
        setJobs(updatedJobs);
        setEditIndex(null);
      } else {
        setJobs([...jobs, data]); // new job from DB
      }

      setNewJob({
        title: "",
        description: "",
        requirements: "",
        skills: "",
        education: "",
        experience: "",
        salaryexpectation: "",
        jobtype: "",
        location: ""
      });
      setShowPopup(false);
    } catch (err) {
      console.error("Error saving job:", err);
      alert(err.message);
    }
  };

  // Delete job
  const handleDelete = async (index) => {
    const jobId = jobs[index]._id;
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete job");
      setJobs(jobs.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Error deleting job:", err);
      alert(err.message);
    }
  };

  // Edit job
  const handleEdit = (index) => {
    setNewJob(jobs[index]);
    setEditIndex(index);
    setShowPopup(true);
  };

  // New job popup
  const handleNewJob = () => {
    setNewJob({
      title: "",
      description: "",
      requirements: "",
      skills: "",
      education: "",
      experience: "",
      salaryexpectation: "",
      jobtype: "",
      location: ""
    });
    setEditIndex(null);
    setShowPopup(true);
  };

  const filteredJobs = [...jobs]
    .sort((a, b) => {
      const aMatch = a.title.toLowerCase().includes(searchText.toLowerCase());
      const bMatch = b.title.toLowerCase().includes(searchText.toLowerCase());
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    })
    .filter(job => job.title.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <Layout showSearch={true}>
      <div className="job-list content pt-2 overflow-y-auto">
        <div className="head-content mb-4 flex justify-between items-center">
          <h1 className="font-bold text-3xl">Job Management</h1>
          <div className="flex justify-center items-center gap-2 border p-2 text-xs mr-10 bg-green-500 rounded-full text-white hover:bg-green-600 transition-color">
            <img src={assets.plus} className="w-3 invert" alt="" />
            <button onClick={handleNewJob} className="text-xs ">
              New Job
            </button>
          </div>

        </div>

        {/* Jobs Listing */}
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => (
            <div key={job._id} className="job border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-normal text-lg border-b mb-4">{job.title}</h3>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li><strong>Description:</strong> {job.description}</li>
                {job.requirements && <li><strong>Requirements:</strong> {job.requirements}</li>}
                {job.skills && <li><strong>Skills:</strong> {job.skills}</li>}
                {job.education && <li><strong>Education:</strong> {job.education}</li>}
                {job.experience && <li><strong>Experience:</strong> {job.experience}</li>}
                {job.salaryexpectation && <li><strong>Salary Expectation:</strong> {job.salaryexpectation}</li>}
                {job.jobtype && <li><strong>Job Type:</strong> {job.jobtype}</li>}
                {job.location && <li><strong>Location:</strong> {job.location}</li>}
              </ul>

              <div className="mt-3 text-sm ">
                <strong>Job ID:</strong>{" "}
                <span className="text-blue-700 font-mono select-all">http://localhost:5173/apply/{job._id}</span>
              </div>

              <div className="operation-Btn gap-2 flex justify-end px-2 mt-3">
                <button onClick={() => handleEdit(index)} className="border p-2 bg-blue-400 rounded-full hover:bg-blue-500 transition-colors" title="Edit Job">
                  <img className="w-5 h-5" src={assets.edit} alt="edit" />
                </button>
                <button onClick={() => handleDelete(index)} className="border p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors" title="Delete Job">
                  <img className="w-5 h-5" src={assets.bin} alt="delete" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm ml-2">No jobs found</p>
        )}


        {/* Popup Modal */}
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white w-[500px] p-6 rounded-lg shadow-lg">
              <h2 className="text-lg font-bold mb-4">{editIndex !== null ? "Edit Job" : "Add New Job"}</h2>
              <div className="flex flex-col gap-2 text-sm">
                <input type="text" name="title" placeholder="Job Title *" value={newJob.title} onChange={handleChange} className="border p-2 rounded" />
                <textarea name="description" placeholder="Job Description *" value={newJob.description} onChange={handleChange} className="border p-2 rounded" />
                <input type="text" name="requirements" placeholder="Requirements" value={newJob.requirements} onChange={handleChange} className="border p-2 rounded" />
                <input type="text" name="skills" placeholder="Skills" value={newJob.skills} onChange={handleChange} className="border p-2 rounded" />
                <input type="text" name="education" placeholder="Education" value={newJob.education} onChange={handleChange} className="border p-2 rounded" />
                <input type="text" name="experience" placeholder="Experience" value={newJob.experience} onChange={handleChange} className="border p-2 rounded" />
                <input type="number" name="salaryexpectation" placeholder="Salary PKR" value={newJob.salaryexpectation} onChange={handleChange} className="border p-2 rounded" />
                <select name="jobtype" value={newJob.jobtype} onChange={handleChange} className="border p-2">
                  <option value="" disabled>Select Job Type</option>
                  <option value="full time">Full Time</option>
                  <option value="part time">Part Time</option>
                  <option value="remote">Internship</option>
                  <option value="remote">Contract based</option>
                </select>
                <input type="text" name="location" placeholder="Location" value={newJob.location} onChange={handleChange} className="border p-2 rounded" />
              </div>
              <div className="flex justify-end text-xs gap-2 mt-6">
                <button className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 transition-colors text-white" onClick={() => setShowPopup(false)}>Cancel</button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" onClick={handleSaveJob}>
                  {editIndex !== null ? "Update Job" : "Save Job"}
                </button>
              </div>
            </div>
          </div>
        )}


        <div className='footer flex justify-center items-center mt-[360px] p-4 text-gray-500 text-xs'>
          <p>Powered by Recruit AI</p>
        </div>
      </div>
    </Layout>
  );
};

export default AddJobs;
