import { useState, useEffect, useContext } from "react";
import { assets } from "../assets/assets";
import { SearchContext } from "../contexts/SearchContext";
import Sidebar from "./Sidebar";
import PopUp from "./PopUp";
import axios from "axios";

const Layout = ({ children, showSearch }) => {
  const { searchText, setSearchText } = useContext(SearchContext);
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState({ initials: "HR" });
  const [jobs, setJobs] = useState([]);


  useEffect(() => {
    axios.get("http://localhost:5000/api/jobs")
      .then(res => setJobs(res.data))
      .catch(err => console.log(err));
  }, []);




  // Fetch HR user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Adjust this API endpoint to match your backend route
        const response = await axios.get("http://localhost:5000/api/hr/me", {
        });

        const data = response.data;
        if (data?.name) {
          const initials = data.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();

          setUser({ ...data, initials });
        } else {
          setUser({ initials: "HR" });
        }
      } catch (error) {
        console.error("Failed to fetch HR info:", error);
        setUser({ initials: "HR" }); // fallback
      }
    };

    fetchUserData();
  }, []);


  return (
    <div className="layout-container flex w-full bg-gray-100 ">
      <Sidebar />
      <div className="content-side w-full ml-[220px] min-h-screen bg-gray-100 ">
        {/* Top Navbar */}
        <div className="content-nav flex justify-between items-center p-3">
          {showSearch ? (
            <div className="search bar bg-white flex p-2 justify-center items-center rounded-lg border border-gray-300  ">
              <input className="w-[500px] bg-white text-sm bg-gray-100 focus:outline-none px-2 " type="text" placeholder="Search for jobs" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
              <button>
                <img className="w-5 h-5" src={assets.search} alt="" />
              </button>
            </div>
            
          ) : (
            <div className="w-[500px]"></div> // placeholder to preserve spacing
          )}


          {/* Profile Button */}
          <div className="usericon  relative">
            <button
              onClick={() => setShowPopup(!showPopup)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0f1d3d] text-white font-light relative z-50"
            >
              {user.initials}
            </button>
          </div>

          {/* Popup */}
          {showPopup && <PopUp showPopup={showPopup} user={user} />}
        </div>

        {/* Main Page Content */}
        <div className="px-3" >{children}</div>
      </div>
    </div>
  );
};

export default Layout;
