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

        // Fetch HR users
        const hrRes = await fetch("http://localhost:5000/api/admin/hrs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const hrData = await hrRes.json();
        setHrUsers(hrData);

        // Fetch Resumes
        const resumeRes = await fetch(
          "http://localhost:5000/api/admin/resumes",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const resumeData = await resumeRes.json();
        setResumes(resumeData);
      } catch (err) {
        console.error("Error fetching admin data:", err);
      }
    };

    fetchData();
  }, []);

  // Filter HR users based on search input
  const filteredHR = hrUsers.filter(
    (user, index) =>
      user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      (index + 1).toString().includes(searchUser)
  );

  // Filter resumes based on search input
  const filteredResumes = resumes.filter(
    (res, index) =>
      res.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      res.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      (res.jobTitle &&
        res.jobTitle.toLowerCase().includes(searchUser.toLowerCase())) ||
      (index + 1).toString().includes(searchUser)
  );

  return (
    <div className="admin-content flex bg-[#f3f4f6] min-h-screen">
      {/* Sidebar */}
      <div
        className="admin-sidebar w-[200px] h-screen fixed 
      bg-gradient-to-b from-[#0a0f1c] via-[#0f1d3d] to-[#0a0f1c] shadow-lg"
      >
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
          <div className="px-3 text-white">
            <button
              className="flex p-2 rounded-lg text-sm bg-red-500 items-center 
            gap-2 mt-[300px] hover:bg-red-400 w-full justify-center shadow-md"
            >
              <img className="w-4 invert" src={assets.logout} alt="" />
              <span>Log Out</span>
            </button>
          </div>
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

        {/* Search Bar */}
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

        <div className="panel-info w-full">
          {/* HR Accounts Section */}
          <div className="border bg-white rounded-xl w-full p-4 shadow-md mb-8">
            <h1 className="text-lg font-bold mb-3 text-gray-700">
              HR Accounts
            </h1>

            <table className="border w-full text-center rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-sm">
                <tr>
                  <th className="border px-2 py-2">ID</th> {/* Added ID */}
                  <th className="border px-2 py-2">Name</th>
                  <th className="border px-2 py-2">Email</th>
                  <th className="border px-2 py-2">Role</th>
                  <th className="border px-2 py-2">Manage</th>
                </tr>
              </thead>

              <tbody>
                {filteredHR.map(
                  (
                    user,
                    index // Filtered
                  ) => (
                    <tr
                      key={user._id}
                      className="text-sm hover:bg-gray-50 transition"
                    >
                      <td className="border px-2 py-2">{index + 1}</td>
                      <td className="border px-2 py-2">{user.name}</td>
                      <td className="border px-2 py-2">{user.email}</td>
                      <td className="border px-2 py-2">{user.role}</td>
                      <td className="border px-2 py-2">
                        <button className="bg-red-500 text-white text-xs px-3 py-1 rounded-full hover:bg-red-600 shadow-sm">
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                )}

                {filteredHR.length === 0 && (
                  <tr>
                    <td colSpan="5" className="border px-2 py-2">
                      No HR users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Resume Section */}
          <div className="border bg-white rounded-xl w-full p-4 shadow-md">
            <h1 className="text-lg font-bold mb-3 text-gray-700">
              Candidate Resumes
            </h1>

            <table className="border w-full text-center rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-sm">
                <tr>
                  <th className="border px-2 py-2">ID</th> {/* Added ID */}
                  <th className="border px-2 py-2">Name</th>
                  <th className="border px-2 py-2">Email</th>
                  <th className="border px-2 py-2">Applied Job</th>
                  <th className="border px-2 py-2">AI Score</th>
                  <th className="border px-2 py-2">Resume</th>
                  <th className="border px-2 py-2">Manage</th>
                </tr>
              </thead>

              <tbody>
                {filteredResumes.map(
                  (
                    res,
                    index // Filtered
                  ) => (
                    <tr
                      key={res._id}
                      className="text-sm hover:bg-gray-50 transition"
                    >
                      <td className="border px-2 py-2">{index + 1}</td>
                      <td className="border px-2 py-2">{res.name}</td>
                      <td className="border px-2 py-2">{res.email}</td>
                      <td className="border px-2 py-2">
                        {res.jobTitle || "N/A"}
                      </td>
                      <td className="border px-2 py-2">
                        {res.aiScore || "Not processed"}
                      </td>
                      <td className="border px-2 py-2">
                        <a
                          href={res.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          View
                        </a>
                      </td>
                      <td className="border px-2 py-2">
                        <button className="bg-red-500 text-white text-xs px-3 py-1 rounded-full hover:bg-red-600 shadow-sm">
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                )}

                {filteredResumes.length === 0 && (
                  <tr>
                    <td colSpan="7" className="border px-2 py-2">
                      No resumes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
