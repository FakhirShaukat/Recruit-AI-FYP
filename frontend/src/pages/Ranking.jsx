import React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { assets } from '../assets/assets';
import Layout from '../components/Layout';
import ModelLoader from "../components/ModelLoader";


const skillInsights = [
    { skill: "Skills", percent: 40 },
    { skill: "Education", percent: 30 },
    { skill: "Experience", percent: 20 },
];
const Ranking = () => {
    const { jobId } = useParams();
    const [results, setResults] = useState([]);
    const [openRow, setOpenRow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [jobTitle, setJobTitle] = useState();
    const [modelConfidence, setModelConfidence] = useState(null);


    const toggleRow = (rank) => {
        setOpenRow(openRow === rank ? null : rank);
    };

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/matching-results/${jobId}`);
                const data = await res.json();

                setJobTitle(data.jobTitle || "Untitled Job");
                setModelConfidence(data.model_confidence ?? null);
                const sortedResumes = (data.resumes || []).sort((a, b) => {
                    const scoreA = parseFloat(a.match_score) || 0;
                    const scoreB = parseFloat(b.match_score) || 0;
                    return scoreB - scoreA;
                });

                setResults(sortedResumes);
            } catch (err) {
                console.error("Error fetching results:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [jobId]);


    if (loading) return <ModelLoader show={true} />;

    return (
        <Layout>
            <div>
                <h1 className='text-3xl font-bold text-gray-800 mb-2'>
                    Ranked Candidates
                </h1>

                {/* Top Cards */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-4'>
                    <div className='bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between'>
                        <div className='flex items-center text-gray-500 mb-2'>
                            <img src={assets.briefcase} className='w-5 mr-2' alt="" />
                            <h2 className='text-sm uppercase font-semibold'>
                                Applied Job
                            </h2>
                        </div>
                        <p className='text-2xl font-bold text-gray-800'>
                            {jobTitle}
                        </p>
                    </div>

                    <div className='bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center'>
                        <div className='flex items-center text-gray-500 mb-2'>
                            <img src={assets.applicant} className='w-4 mr-2' alt="" />
                            <h2 className='text-sm uppercase font-semibold'>
                                Total Applicants
                            </h2>
                        </div>
                        <p className='text-5xl font-extrabold text-blue-600'>{results.length}</p>
                    </div>

                    <div className='bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between'>
                        <div className='flex items-center text-gray-500 mb-2'>
                            <img src={assets.application} className='w-5 mr-2' alt="" />
                            <h2 className='text-sm uppercase font-semibold'>
                                Screening Pipeline
                            </h2>
                        </div>
                        <div className='w-full'>
                            <p className='text-lg font-bold text-gray-800 mb-1'>
                                {results.filter(r => r.match_score !== null).length}/{results.length} Screened
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-green-500 h-2.5 rounded-full"
                                    style={{ width: `70%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ranking Table */}
                <div className='bg-white p-2 rounded-xl shadow-md border border-gray-100'>
                    <div className='mb-4 border-b pb-4'>
                        <div className='flex items-center'>
                            <img src={assets.favourite} className='w-6 mr-2' alt="" />
                            <h2 className='text-xl font-bold text-gray-800'>
                                Top Candidate Rankings
                            </h2>
                        </div>
                    </div>

                    <div className='overflow-x-auto'>
                        <table className='min-w-full divide-y divide-gray-200'>
                            <thead className='bg-gray-400 text-white'>
                                <tr>
                                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                                        Rank
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                                        Candidate
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                                        Match Score
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                                        Resume
                                    </th>
                                    <th className='px-6 py-3 text-center text-xs font-medium uppercase tracking-wider'>
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.map((r, index) => {
                                    const scorePercent = r.match_score ? Math.round(r.match_score) : 0;
                                    let scoreColor = "bg-gray-300";
                                    if (scorePercent >= 70) scoreColor = "bg-green-500";
                                    else if (scorePercent >= 50) scoreColor = "bg-yellow-500";
                                    else scoreColor = "bg-red-500";

                                    return (
                                        <React.Fragment key={index}>
                                            {/* MAIN ROW */}
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-6 py-4">{index + 1}</td>
                                                <td className="px-6 py-4">{r.name}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                                            <div className={`${scoreColor} h-2 rounded-full`} style={{ width: `${scorePercent}%` }}></div>
                                                        </div>
                                                        <span className="text-sm font-semibold">{scorePercent}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500"><a href={`http://127.0.0.1:8000${r.resume_path}`}>Resume.pdf</a></td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => toggleRow(index)}
                                                        className="text-white bg-green-500 hover:bg-green-600 py-1 px-3 rounded-full text-xs"
                                                    >
                                                        {openRow === index ? "Collapse" : "View Details"}
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* EXPANDABLE ROW */}
                                            {openRow === index && (
                                                <tr>
                                                    <td colSpan="5" className="bg-gray-50 px-6 py-4">
                                                        <div className="transition-all duration-500 ease-in-out overflow-hidden">
                                                            <p className="text-gray-700 mb-2"><strong>Skills Match:</strong> {Math.round(r.skills?.score * 100 || "0")}%</p>
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
                </div>

                {/* Insights */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
                    <div className='bg-white p-6 rounded-xl shadow-md border border-gray-100'>
                        <h2 className='text-xl font-bold text-gray-800 mb-4'>
                            Key Insights
                        </h2>

                        <ul className='space-y-1 text-sm'>
                            {skillInsights.map((item, index) => (
                                <li key={index} className='flex justify-between'>
                                    <span className='font-medium'>{item.skill}:</span>
                                    <span className='text-blue-600 font-semibold ml-2'>
                                        {item.percent}%
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className='bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center'>
                        <h2 className='text-xl font-bold text-gray-800 mb-2'>
                            Model Confidence Score
                        </h2>
                        <p className='text-6xl font-extrabold text-teal-500'>
                            {modelConfidence !== null ? `${modelConfidence}%` : "--"}
                        </p>
                        <p className='text-sm text-gray-500 mt-2'>
                            The model's confidence in the ranking accuracy.
                        </p>
                    </div>
                </div>

                <div className='footer flex justify-center items-center mt-8 p-4 text-gray-500 text-xs'>
                    <p>Powered by Recruit AI</p>
                </div>
            </div>
        </Layout>
    );
};

export default Ranking;
