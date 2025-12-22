import { useState, useEffect } from "react";
import { Link } from 'react-router-dom'
import Layout from "../components/Layout";
import { assets } from "../assets/assets";
import PageLoader from "../components/PageLoader.jsx";
import HistogramComp from "../components/HistogramComp.jsx";


const Dashboard = () => {
    const [date, setDate] = useState(new Date());
    const [jobsCount, setJobsCount] = useState(0);
    const [myjobs, setmyjobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resumeCount, setResumeCount] = useState(0);
    const [histogram, setHistogramData] = useState([]);
    const [screened, setScreened] = useState(0);
    const [topCandidates, setTopCandidates] = useState([]);

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

    // ------------------ Fetch Histogram Data ------------------
    useEffect(() => {
        const fetchRankingScores = async () => {
            try {
                const res = await fetch("http://localhost:8000/previous-rankings");
                const data = await res.json();

                const scores = [];
                let screenedCount = 0;
                const candidates = [];

                data.forEach(job => {
                    job.resumes.forEach(c => {
                        if (c.match_score !== null) {
                            const score = Math.round(c.match_score);
                            scores.push(score);

                            // Add candidate to array
                            candidates.push({
                                name: c.name,
                                score
                            });
                        }
                        screenedCount++;
                    });
                });

                setScreened(screenedCount);

                // Sort and get top 3
                const top3 = candidates
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3);

                setTopCandidates(top3);

                // Histogram bins
                const bins = Array(10).fill(0);
                scores.forEach(score => {
                    const index = Math.min(Math.floor(score / 10), 9);
                    bins[index]++;
                });

                const histogramData = bins.map((count, i) => ({
                    range: `${i * 10 + 1}-${(i + 1) * 10}`,
                    count,
                }));

                setHistogramData(histogramData);

            } catch (err) {
                console.error(err);
            }
        };

        fetchRankingScores();
    }, []);

    return (
        <Layout showSearch={false}>
            <div className="dashboard-content  ">
                <h1 className="text-3xl font-bold  mb-4" >Dashboard</h1>
                <div className="dash-info flex gap-2  ">
                    <div className="content w-[700px]">
                        <div className="cards flex justify-center gap-4">

                            <div className=" card border bg-white rounded-md border-gray-300  w-[220px] p-2 px-4 h-[110px]">
                                <div className="flex justify-between items-center">
                                    <h2 className=" mt-2 text-sm font-inter ">Total Jobs</h2>
                                    <img className="border rounded-full w-9 p-1" src={assets.arrow2} alt="" />
                                </div>
                                <p className="text-4xl pt-2  font-semibold">{jobsCount}</p>
                            </div>

                            <div className="card border bg-white rounded-md border-gray-300   p-2 px-4 w-[220px] h-[110px]">
                                <div className="flex justify-between items-center">
                                    <h2 className=" mt-2 text-sm font-inter ">Resume Screen</h2>
                                    <img className="border rounded-full w-9 p-1" src={assets.arrow2} alt="" />
                                </div>
                                <p className=" text-4xl pt-2  font-semibold">{screened}</p>
                            </div>

                            <div className="card border flex flex-col bg-white border-gray-300  rounded-md p-2 px-4 w-[220px] h-[110px]">
                                <div className="flex justify-between items-center">
                                    <h2 className=" mt-2 text-sm font-inter ">Applications Today</h2>
                                    <img className="border rounded-full w-9 p-1" src={assets.arrow2} alt="" />
                                </div>
                                <p className=" text-4xl pt-2 font-semibold">{resumeCount}</p>
                            </div>

                        </div>
                        <div className="evaluation-graph w-full  border h-[350px] bg-white rounded-md mt-2">
                            <div className="flex items-center p-2 gap-2 border w-full bg-gradient-to-b text-white from-[#0a0f1c] via-[#0f1d3d] to-[#0a0f1c] rounded-t-md">
                                <h1 className="text-md font-semibold ">Evaluation Graph</h1>
                                <img className="w-6" src={assets.up} alt="" />
                            </div>
                            <div className="m-2  w-11/12 h-52 text-xs mt-3">
                                {histogram.length > 0 ? (
                                    <HistogramComp data={histogram} />
                                ) : (
                                    <p className="text-center text-gray-500">No ranking data available</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="ranked-cand w-full h-full h-auto ">
                        <div className="bg-white rounded-md p-4 border border-gray-300 ">
                            <div className="flex justify-center items-center gap-2 pb-2">
                                <img className="w-8" src={assets.quality} alt="trophy" />
                                <h2 className="text-lg font-semibold mb-2">Top Ranked Candidates</h2>
                            </div>
                            <div className="cand-list p-2">
                                <ul className="text-sm">
                                    {topCandidates.length === 0 ? (
                                        <li className="p-2 text-gray-500">No top candidates yet!</li>
                                    ) : (
                                        topCandidates.map((c, index) => (
                                            <li key={index}>
                                                <div className="flex justify-between">
                                                    <p>{c.name}</p>
                                                    <span className="text-blue-500">{c.score}%</span>
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </div>
                        <div className="jobs-section mt-2 h-auto  bg-white rounded-md border border-gray-300">
                            <h1 className="p-2 font-inter  bg-gradient-to-b text-white from-[#0a0f1c] via-[#0f1d3d] to-[#0a0f1c] rounded-t-md">Recent Jobs</h1>
                            <div className="jobs-list mt-2">
                                <ul className="text-sm overflow-y-auto h-full pr-2">
                                    {myjobs.length === 0 ? (
                                        <li className="p-2 text-gray-500">No jobs yet!</li>
                                    ) : (
                                        myjobs.slice(0, 3).map((job) => (
                                            <li key={job._id} className="border-b p-2 font-inter">{job.title}</li>
                                        ))
                                    )}
                                </ul>

                            </div>
                            <Link to="/addjobs">
                                <div className="mt-2 flex justify-end p-2 px-2">
                                    <button className="text-xs p-2 border bg-green-500 text-white rounded-full font-semibold">View All Jobs</button>
                                </div>
                            </Link>
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
