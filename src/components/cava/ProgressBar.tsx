"use client";

import { useState, useEffect } from 'react';

const ProgressBar = () => {
    const [progress, setProgress] = useState(0);
    const initialDate = new Date('2025-05-25').getTime();
    const finalDate = new Date('2025-09-22').getTime();
    const barColor = '#e15162'; // Your specified color

    useEffect(() => {
        const calculateProgress = () => {
            const now = Date.now();
            const totalDuration = finalDate - initialDate;
            const elapsed = now - initialDate;

            let percentage = (elapsed / totalDuration) * 100;

            // Ensure percentage stays between 0 and 100
            percentage = Math.min(100, Math.max(0, percentage));
            setProgress(percentage);
        };

        // Calculate immediately on mount
        calculateProgress();

        // Update every minute
        const interval = setInterval(calculateProgress, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-3xl mx-auto p-6 bg-transparent rounded-xl shadow-lg">
            {/*<div className="invisible flex justify-between mb-2 md:visible">
                <span className="text-sm font-medium text-white">TEQUILA BLANCO TO TEQUILA REPOSADO</span>

            </div>*/}

            <div className="w-full bg-gray-200 rounded-full h-4 text-center text-black text-md">
                <div
                    className="rounded-full h-4 transition-all duration-1000 ease-out"
                    style={{
                        width: `${progress}%`,
                        backgroundColor: barColor
                    }}
                >
                    {progress.toFixed(1)}%
                </div>
                
            </div>

            {/*<div className="mt-1 flex justify-between">
                <div className="text-center">
                    <div className="text-lg font-bold text-white" >  *style={{ color: barColor }} *
                        {progress.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">Completed</div>
                </div>

                <div className="text-center">
                    <div className="text-lg font-bold text-gray-700">
                        {Math.floor(100 - progress).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">Remaining</div>
                </div>
            </div>

            <div className="mt-4 text-center text-sm text-white">
                {progress < 100
                    ? `Ends in ${Math.ceil((finalDate - Date.now()) / (1000 * 60 * 60 * 24))} days`
                    : "Target date reached!"}
            </div>*/}
        </div>
    );
};

export default ProgressBar;