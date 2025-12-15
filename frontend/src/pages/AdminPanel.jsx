import React, { useEffect, useState, useContext } from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import { SearchContext } from "../contexts/SearchContext";

const AdminPanel = () => {
  const [hrUsers, setHrUsers] = useState([]);
  const [resumes, setResumes] = useState([]);
  const { searchUser, setSearchUser } = useContext(SearchContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) return;

        // ---- FETCH HR USERS ----
        const hrRes = await fetch("http://localhost:5000/api/admin/hrs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const hrData = await hrRes.json();
        setHrUsers(hrData || []);

        // ---- FETCH RESUMES ----
        const resumeRes = await fetch(
          "http://localhost:5000/api/admin/resumes",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const resumeData = await resumeRes.json();
        setResumes(resumeData || []);
      } catch (err) {
        console.error("Error fetching admin data:", err);
      }
    };

    fetchData();
  }, []);

  // Safely default searchUser to ""
  const search = searchUser?.toLowerCase() || "";

  // ---- HR Filtering ----
  const filteredHR = hrUsers.filter((user, index) => {
    const name = user.name || "";
    const email = user.email || "";
    return (
      name.toLowerCase().includes(search) ||
      email.toLowerCase().includes(search) ||
      (index + 1).toString().includes(search)
    );
  });

  // ---- Resume Filtering ----
  const filteredResumes = resumes.filter((res, index) => {
    const name = res.name || "";
    const email = res.email || "";
    const jobTitle = res.jobTitle || "";
    return (
      name.toLowerCase().includes(search) ||
      email.toLowerCase().includes(search) ||
      jobTitle.toLowerCase().includes(search) ||
      (index + 1).toString().includes(search)
    );
  });

  const deleteResume = async (id) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this resume?");
      if (!confirmDelete) return;

      const res = await fetch(`http://localhost:5000/api/admin/resume/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        // Remove deleted resume from state
        setResumes(resumes.filter((r) => r._id !== id));
        alert("Resume deleted successfully!");
      } else {
        alert(data.message || "Failed to delete resume");
      }
    } catch (err) {
      console.error("Error deleting resume:", err);
      alert("Server error while deleting resume");
    }
  };



  return (
    <div className="admin-content flex bg-[#f3f4f6] min-h-screen">
      {/* Sidebar */}
      <div className="admin-sidebar w-[200px] h-screen fixed bg-gradient-to-b from-[#0a0f1c] via-[#0f1d3d] to-[#0a0f1c] shadow-lg">
        <div className="flex items-center gap-2 p-3">
          <img src={assets.logo} className="w-12" alt="" />
          <h1 className="logo text-white text-xl font-bold">RecruitAI</h1>
        </div>

        <div className="headings flex flex-col justify-center items-center mt-10 space-y-2 text-white">
          <img
            className="w-12 invert border-gray-700 border rounded-full p-2 shadow-md"
            src={assets.admin}
            alt=""
          />
          <h1 className="font-semibold text-md">Admin</h1>
        </div>

        <Link to="/">
          <button className="flex p-2 rounded-lg text-sm bg-red-500 items-center gap-2 mt-[300px] hover:bg-red-400 w-full  justify-center shadow-md text-white">
            <img className="w-4 invert" src={assets.logout} alt="" />
            <span>Log Out</span>
          </button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="admin-content ml-[200px] p-6 w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 tracking-wide">
          Admin Dashboard
        </h1>

        {/* Summary Cards */}
        <div className="flex gap-4 mb-8">
          <div className="p-4 bg-white shadow-lg border rounded-xl w-[200px] text-center hover:shadow-xl transition">
            <h2 className="text-lg font-bold text-gray-700">HR Users</h2>
            <p className="text-3xl font-semibold text-blue-600 mt-2">
              {hrUsers.length}
            </p>
          </div>

          <div className="p-4 bg-white shadow-lg border rounded-xl w-[200px] text-center hover:shadow-xl transition">
            <h2 className="text-lg font-bold text-gray-700">Resumes</h2>
            <p className="text-3xl font-semibold text-green-600 mt-2">
              {resumes.length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white border p-3 mb-6 text-sm rounded-xl w-1/2 shadow-md flex items-center gap-3">
          <img src={assets.search} className="w-5 opacity-70" alt="search" />
          <input
            className="focus:outline-none w-full"
            type="text"
            placeholder="Search user or candidate..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
          />
        </div>

        {/* HR Accounts */}
        <div className="border bg-white rounded-xl w-full p-4 shadow-md mb-8">
          <h1 className="text-lg font-bold mb-3 text-gray-700">HR Accounts</h1>

          <table className="border w-full text-center rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-sm">
              <tr>
                <th className="border px-2 py-2">ID</th>
                <th className="border px-2 py-2">Name</th>
                <th className="border px-2 py-2">Email</th>
                <th className="border px-2 py-2">Role</th>
              </tr>
            </thead>

            <tbody>
              {filteredHR.map((user, index) => (
                <tr key={user._id} className="text-sm hover:bg-gray-50 transition">
                  <td className="border px-2 py-2">{index + 1}</td>
                  <td className="border px-2 py-2">{user.name || "N/A"}</td>
                  <td className="border px-2 py-2">{user.email || "N/A"}</td>
                  <td className="border px-2 py-2">{user.role || "N/A"}</td>
                </tr>
              ))}

              {filteredHR.length === 0 && (
                <tr>
                  <td colSpan="4" className="border px-2 py-2">
                    No HR users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Resumes */}
        <div className="border bg-white rounded-xl w-full p-4 shadow-md">
          <h1 className="text-lg font-bold mb-3 text-gray-700">
            Candidate Applications
          </h1>

          <table className="border w-full text-center rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-sm">
              <tr>
                <th className="border px-2 py-2">ID</th>
                <th className="border px-2 py-2">Name</th>
                <th className="border px-2 py-2">Email</th>
                <th className="border px-2 py-2">Applied Job</th>
                <th className="border px-2 py-2">Resume</th>
                <th className="border px-2 py-2">Modify</th>
              </tr>
            </thead>

            <tbody>
              {filteredResumes.map((res, index) => (
                <tr key={res._id} className="text-sm hover:bg-gray-50 transition">
                  <td className="border px-2 py-2">{index + 1}</td>
                  <td className="border px-2 py-2">{res.name || "N/A"}</td>
                  <td className="border px-2 py-2">{res.email || "N/A"}</td>
                  <td className="border px-2 py-2">{res.jobTitle || "N/A"}</td>
                  <td className="border px-2 py-2">
                    <a
                      href={res.resumeUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 text-sm"
                    >
                      View
                    </a>
                  </td>
                  <td className="border"><button onClick={()=> deleteResume(res._id)} className=" bg-red-500 text-white px-2 py-1 rounded-full text-xs hover:bg-red-600">Delete</button></td>
                </tr>
              ))}

              {filteredResumes.length === 0 && (
                <tr>
                  <td colSpan="6" className="border px-2 py-2">
                    No resumes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
