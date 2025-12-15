import { useState, useEffect } from "react";
import { Link } from 'react-router-dom'
import Layout from "../components/Layout";
import { assets } from "../assets/assets";
import PageLoader from "../components/PageLoader.jsx";


const Dashboard = () => {
    const [date, setDate] = useState(new Date());
    const [jobsCount, setJobsCount] = useState(0);
    const [myjobs, setmyjobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resumeCount, setResumeCount] = useState(0);

    const user = JSON.parse(localStorage.getItem("user")) || {
        initials: "U",
        name: "HR",
        email: "hr@example.com",
    };

    useEffect(() => {
        const fetchJobs = async () => {
            const token = localStorage.getItem("token"); // Get JWT
            if (!token) return;

            try {
                const res = await fetch("http://localhost:5000/api/jobs", {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`, // Send token
                    },
                });

                if (!res.ok) throw new Error("Failed to fetch jobs");
                const data = await res.json();

                setJobsCount(data.length);
                setmyjobs(data); // Set count dynamically
            } catch (err) {
                console.error("Error fetching jobs:", err);
            }
        };

        fetchJobs();
    }, []);
    useEffect(() => {
        const fetchResumeCount = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user?.email) return;

                const res = await fetch(`http://localhost:5000/api/candidate/count/${user.email}`);
                if (!res.ok) throw new Error("Failed to fetch resume count");

                const data = await res.json();
                setResumeCount(data.count);
            } catch (error) {
                console.error("Error fetching resume count:", error);
            }
        };

        fetchResumeCount();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);
    if (loading) {
        return <PageLoader />;
    }

    return (
        <Layout>
            <div className="dashboard-content  ">
                <h1 className="text-3xl font-bold  mb-4" >Dashboard</h1>
                <div className="dash-info flex gap-2  ">
                    <div className="content w-[700px]">
                        <div className="cards flex justify-center gap-4">

                            <div className=" card border bg-gray-300 rounded-lg shadow-md w-[220px] p-2 px-4 h-[100px]">
                                <h2 className="text-white mt-1 text-md font-inter">Total Jobs</h2>
                                <p className="text-4xl font-semibold">{jobsCount}</p>
                            </div>

                            <div className="card border bg-[#23559A] rounded-lg shadow-md p-2 px-4 w-[220px] h-[100px]">
                                <h2 className="text-white mt-1 text-md font-inter">Resume Screen</h2>
                                <p className="text-white text-4xl font-semibold">0</p>
                            </div>

                            <div className="card border bg-[#4D5FE8] rounded-lg shadow-md p-2 px-4 w-[220px] h-[100px]">

                                <h2 className="text-white mt-1 text-md font-inter ">Applications Today</h2>
                                <p className="text-white text-4xl font-semibold">{resumeCount}</p>

                            </div>

                        </div>
                        <div className="jobs-n-graph-section flex justify-center gap-3  mt-4">
                            <div className="myjobs w-[300px] border rounded-lg shadow-md p-2 bg-gray-200">
                                <h1 className="font-semibold text-lg font-inter">My Jobs</h1>
                                <p className="text-xs text-gray-400 mt-2 ">Active job posting</p>
                                <div className="jobs-list mt-2 border h-[220px] bg-white  rounded-lg relative ">
                                    <ul className="text-sm overflow-y-auto h-full pr-2">
                                        {myjobs.length === 0 ? (
                                            <li className="p-2 text-gray-500">No jobs yet!</li>
                                        ) : (
                                            myjobs.slice(0, 3).map((job) => (
                                                <li key={job._id} className="border-b p-2 font-inter">{job.title}</li>
                                            ))
                                        )}
                                    </ul>
                                    <Link to="/addjobs"><button className="absolute bottom-2 right-2 text-xs bg-green-400 text-white px-3 py-1 rounded-lg hover:bg-green-500 transition duration-300">View All Jobs</button></Link>
                                </div>
                            </div>
                            <div className="myjobs w-[380px] border rounded-lg shadow-md p-2 bg-gray-200">
                                <h1 className="font-semibold text-lg font-inter">Evaluation Graph</h1>
                                <p className="mt-2 text-xs text-gray-400 ">Weekly Progress</p>
                                <div className="graph flex justify-center mt-2 items-center border rounded-lg h-[250px] bg-white">
                                    <p>Graph will be here</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="content border rounded-lg shadow-md bg-gray-200 w-[300px] h-[405px]">
                        <div className="heading flex justify-center items-center p-4 gap-2 ">
                            <img className="w-8" src={assets.quality} alt="" />
                            <h1 className="text-center  text-lg font-semibold font-inter">Top Ranked Candidates</h1>
                        </div>
                        <div className="ranked-list border bg-white h-[310px] mx-2 rounded-lg p-4 ">
                            <ul className="w-full text-xl space-y-3">
                                <li className="border-b">1 | Ali Khan</li>
                                <li className="border-b">2 | Hamza Ahmed</li>
                                <li className="border-b">3 | Sara Khan</li>
                            </ul>

                        </div>
                    </div>
                </div>

                <div className='footer flex justify-center items-center mt-8 p-4 text-gray-500 text-xs'>
                    <p>Powered by Recruit AI</p>
                </div>


            </div>


        </Layout>
    );
};

export default Dashboard;
