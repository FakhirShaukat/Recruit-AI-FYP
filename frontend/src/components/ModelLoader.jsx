import React from 'react'

const ModelLoader = ({show}) => {

    if(!show) return null;

    const messages = [
        "Screening Resumes…",
        "Parsing Key Entities…",
        "Matching Skills, Experience & Education…",
        "Saving Results…"
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
                <div className="loader mx-auto mb-3 border-4 border-gray-300 border-t-blue-600 rounded-full w-10 h-10 animate-spin"></div>
                <p className="animate-pulse text-lg font-semibold">
                    {messages[Math.floor(Math.random() * messages.length)]}
                </p>
            </div>
        </div>
    )
}

export default ModelLoader
