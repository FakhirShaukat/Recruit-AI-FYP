import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";

const Shortlisted = () => {
    const { jobId } = useParams();
    const [shortlisted, setShortlisted] = useState([]);
    const [jobTitle, setJobTitle] = useState("");
    const [loading, setLoading] = useState(true);

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
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFromDB();
    }, [jobId]);

    if (loading) return <p>Loading...</p>;

    return (
        <Layout>
            <div>
                <h1 className="text-3xl font-bold mb-2">Shortlisted Candidates</h1>

                <p className="text-gray-500 mb-6">
                    Top 3 candidates for <strong className="font-semibold text-green-500">{jobTitle}</strong>
                </p>

                <div className=" w-full w-[300px] " >
                    {shortlisted.map((c, index) => (
                        <div className="mb-4" >
                            <ul key={index} className="w-full rounded-md flex justify-between items-center border p-2 bg-white">
                                <li>{index + 1}# {c.name}</li>
                                <p>{Math.round(c.match_score)}%</p>
                            </ul>

                        </div>

                    ))}


                </div>
            </div>



            {/*
                                <div className="border w-full w-1/2 p-6 ">
                {shortlisted.map((c, index) => (
                    <div key={index} className="">
                        <i>#{index + 1} {c.name}</i>
                        <p className="">{Math.round(c.match_score)}%</p>
                    </div>
                ))}
            </div>
                */}



        </Layout>
    );
};

export default Shortlisted;
