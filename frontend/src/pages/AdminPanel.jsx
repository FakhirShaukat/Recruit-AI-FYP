import React, { useEffect, useState, useContext } from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import { SearchContext } from "../contexts/SearchContext";
// import { SearchContext } from "../contexts/SearchContext";

const AdminPanel = () => {
  const [hrUsers, setHrUsers] = useState([]);
  const [resumes, setResumes] = useState([]);
  const { searchUser, setSearchUser } = useContext(SearchContext);
  // const { searchUser, setSearchUser } = useContext(SearchContext);

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

  return (
    <div className="admin-content flex ">
      <div className="admin-sidebar w-[200px] h-screen fixed bg-gradient-to-b from-[#0a0f1c] via-[#0f1d3d] to-[#0a0f1c]">
        <div className="flex  items-center gap-2 p-1">
          <img src={assets.logo} className="w-12" alt="" />
          <h1 className="logo text-white  text-xl font-bold cursor-pointer">
            RecruitAI
          </h1>
        </div>
        <div className="headings h-[100px] flex flex-col justify-center items-center mt-10 space-y-2 text-white">
          <img
            className="w-10 invert border-gray-900 border rounded-full border p-1"
            src={assets.admin}
            alt=""
          />
          <h1 className="font-semibold text-md">Hello Admin </h1>
        </div>

        <Link to="/">
          <div className="logout cursor-pointer px-2 text-white ">
            <button className="flex p-2 rounded-lg text-sm w-full  bg-red-500  items-center gap-2 mt-[300px]">
              <img className="w-4 invert" src={assets.logout} alt="" />
              <span>Log Out</span>
            </button>
          </div>
        </Link>
      </div>

      <div className="admin-content ml-[200px] p-6 w-full">
        <h1 className="text-3xl font-bold mb-4 text-black">Admin Panel</h1>
        <div className="border border-black p-2 mb-2 text-sm rounded-lg w-1/2 shadow-md">
          <input
            className="focus:outline-none w-full"
            type="text"
            placeholder="Search User"
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
          />
        </div>
        <div className="panel-info w-full h-[80vh]">
          <div className="hr-accounts-detail border rounded-lg w-full h-auto p-2">
            <h1 className="text-md font-bold mb-2">HR Accounts</h1>
            <div className="account-lists">
              <table className="border w-full text-center">
                <thead className="bg-gray-100 text-sm">
                  <tr>
                    <th className="border px-1 py-1">HR ID</th>
                    <th className="border px-1 py-1">Name</th>
                    <th className="border px-1 py-1">Email</th>
                    <th className="border px-1 py-1">Role</th>
                    <th className="border px-1 py-1">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {hrUsers.map((user, index) => (
                    <tr key={user._id} className="text-sm">
                      <td className="border px-1 py-1">{index + 1}</td>
                      <td className="border px-1 py-1">{user.name}</td>
                      <td className="border px-1 py-1">{user.email}</td>
                      <td className="border px-1 py-1">{user.role}</td>
                      <td className="border px-1 py-1">
                        <button className="bg-red-500 text-white text-xs px-2 py-1 rounded-full hover:bg-red-600">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {hrUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="border px-1 py-1">
                        No HR users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-2 border w-full h-auto p-2 rounded-lg">
            <h1 className="font-bold text-md">Resumes</h1>
            <div className="account-lists">
              <table className="border w-full text-center">
                <thead className="bg-gray-100 text-sm">
                  <tr>
                    <th className="border px-1 py-1">ID</th>
                    <th className="border px-1 py-1">Name</th>
                    <th className="border px-1 py-1">Email</th>
                    <th className="border px-1 py-1">Applied Job</th>
                    <th className="border px-1 py-1">Resume</th>
                    <th className="border px-1 py-1">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {hrUsers.map((user, index) => (
                    <tr key={user._id} className="text-sm">
                      <td className="border px-1 py-1">{index + 1}</td>
                      <td className="border px-1 py-1">{user.name}</td>
                      <td className="border px-1 py-1">{user.email}</td>
                      <td className="border px-1 py-1">Frontend Developer</td>
                      <td className="border px-1 py-1">Resume.pdf</td>
                      <td className="border px-1 py-1">
                        <button className="bg-red-500 text-white text-xs px-2 py-1 rounded-full hover:bg-red-600">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {hrUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="border px-1 py-1">
                        No HR users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
