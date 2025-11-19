import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';
import Layout from '../components/Layout';

const candidates = [
    { rank: 1, name: "Emma Watson", score: 98, scoreColor: "bg-blue-800" },
    { rank: 2, name: "John Smith", score: 92, scoreColor: "bg-teal-500" },
    { rank: 3, name: "Staisy Gray", score: 77, scoreColor: "bg-cyan-500" },
    { rank: 4, name: "Emily Washington", score: 70, scoreColor: "bg-cyan-500" },
    { rank: 5, name: "Dwayne Johnson", score: 68, scoreColor: "bg-orange-500" },
];

const skillInsights = [
    { skill: "Skills", percent: 40 },
    { skill: "Education", percent: 30 },
    { skill: "Experience", percent: 20 },
];


const Ranking = () => {
    return (
        <Layout>
            <div className=' '>
                <h1 className='text-3xl font-bold text-gray-800 mb-2'>Ranked Candidates</h1>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-4'>

                    <div className='bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between'>
                        <div className='flex items-center text-gray-500 mb-2'>
                            <img src={assets.briefcase} className='w-5 mr-2' alt="Briefcase Icon" />
                            <h2 className='text-sm uppercase font-semibold'>Applied Job</h2>
                        </div>
                        <p className='text-2xl font-bold text-gray-800'>Frontend Developer</p>
                    </div>
                    <div className='bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center'>
                        <div className='flex items-center text-gray-500 mb-2'>
                            <img src={assets.applicant} className='w-4 mr-2' alt="Applicant Icon" />
                            <h2 className='text-sm uppercase font-semibold'>Total Applicants</h2>
                        </div>
                        <p className='text-5xl font-extrabold text-blue-600'>10</p>
                    </div>
                    <div className='bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between'>
                        <div className='flex items-center text-gray-500 mb-2'>
                            <img src={assets.application} className='w-5 mr-2' alt="Screening Icon" />
                            <h2 className='text-sm uppercase font-semibold'>Screening Pipeline</h2>
                        </div>
                        <div className='w-full'>
                            <p className='text-lg font-bold text-gray-800 mb-1'>7/10 Screened</p>
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `70%` }}></div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className='bg-white p-2 rounded-xl shadow-md border border-gray-100'>
                    <div className=' mb-4 border-b pb-4'>
                        <div className='flex items-center'>
                            <img src={assets.favourite} className='w-6 mr-2' alt="Star Icon" />
                            <h2 className='text-xl font-bold text-gray-800'>Top Candidate Rankings</h2>
                        </div>
                    </div>
                    <div className='overflow-x-auto'>
                        <table className='min-w-full divide-y divide-gray-200'>
                            <thead className='bg-gray-400 text-white'>
                                <tr>
                                    <th className='px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider'>Rank</th>
                                    <th className='px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider'>Candidate</th>
                                    <th className='px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider'>Match Score</th>
                                    <th className='px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider'>Resume</th>
                                    <th className='px-6 py-3 text-center text-xs font-medium  uppercase tracking-wider'>Action</th>
                                </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-gray-200'>
                                {candidates.map((candidate) => (
                                    <tr key={candidate.rank} className='hover:bg-gray-50'>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>#{candidate.rank}</td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>{candidate.name}</td>

                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <div className='flex items-center'>
                                                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div
                                                        className={`${candidate.scoreColor} h-2 rounded-full transition-all duration-500`}
                                                        style={{ width: `${candidate.score}%` }}
                                                    ></div>
                                                </div>
                                                <span className='text-sm font-semibold text-gray-800'>{candidate.score}%</span>
                                            </div>
                                        </td>

                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                            <button title="View Resume" className=''>
                                                Resume.pdf
                                            </button>
                                        </td>

                                        <td className='px-6 py-4 whitespace-nowrap text-center'>
                                            <button className='text-white bg-green-500 hover:bg-green-600 py-1 px-3 rounded-full text-xs'>
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
                    <div className='bg-white p-6 rounded-xl shadow-md border border-gray-100'>
                        <h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center'>
                            <p>Key Insights</p> 
                        </h2>
                        <div className="flex items-center">
                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500 mr-4">
                                Chart Placeholder
                            </div>
                            <ul className='space-y-1 text-sm'>
                                {skillInsights.map((item, index) => (
                                    <li key={index} className='flex justify-between'>
                                        <span className='font-medium'>{item.skill}:</span>
                                        <span className='text-blue-600 font-semibold ml-2'>{item.percent}%</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className='bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center'>
                        <h2 className='text-xl font-bold text-gray-800 mb-2'>
                            Model Confidence Score
                        </h2>
                        <p className='text-6xl font-extrabold text-teal-500'>95%</p>
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
}

export default Ranking;