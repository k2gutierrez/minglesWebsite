"use client";

import { useState, useEffect, useCallback } from 'react';
import barrel from "../../public/images/MinglesBarrel2.png"
import Image from 'next/image';

const CountdownTimer = () => {
  const targetDate = new Date('2025-05-24T00:00:00').getTime();
  
  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-1">
      
      <h1 className="text-4xl mb-8 font-bold text-center">
        Cava program: May 24, 2025
      </h1>
      
      <div className="flex flex-wrap gap-4 justify-center">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div 
            key={unit}
            className="flex flex-col items-center bg-gray-700/50 p-6 rounded-lg backdrop-blur-sm"
          >
            <span className="text-6xl font-bold tabular-nums mb-2">
              {value.toString().padStart(2, '0')}
            </span>
            <span className="text-xl uppercase tracking-wider text-gray-300">
              {unit}
            </span>
          </div>
        ))}
      </div>

      {/* Optional Progress Bar */}
      <div className="w-full max-w-2xl mt-8 bg-gray-700 rounded-full h-2.5">
        <div 
          className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000" 
          style={{ 
            width: `${((timeLeft.days / 365) * 100).toFixed(2)}%` 
          }}
        ></div>
      </div>
    </div>
  );
};

export default CountdownTimer;