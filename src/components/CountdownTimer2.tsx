"use client";

import { useState, useEffect } from 'react';
import barrel from "../../public/images/MinglesBarrel2.png"
import Image from 'next/image';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer2 = () => {
  const targetDate = new Date('2025-05-24T00:00:00').getTime();

  const calculateTimeLeft = (): TimeLeft => {
    const now = Date.now();
    const difference = targetDate - now;

    return difference > 0 ? {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    } : { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl 
      shadow-lg hover:bg-white/20 transition-all duration-300 w-full max-w-[120px] 
      border border-white/20">
      <span className="text-4xl md:text-6xl font-bold text-purple-400 mb-2">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-sm md:text-base uppercase tracking-wider text-purple-200">
        {label}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-purple-900">
      <div className="text-center space-y-8">
        
        <h1 className="text-base md:text-2xl font-bold text-white mb-6 animate-pulse border">
          <Image src={barrel} alt='Cava Program' width={80} height={80} />Coming May 24, 2025
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2 md:ms-15">
          <TimeUnit value={timeLeft.days} label="Days" />
          <TimeUnit value={timeLeft.hours} label="Hours" />
          <TimeUnit value={timeLeft.minutes} label="Minutes" />
          <TimeUnit value={timeLeft.seconds} label="Seconds" />
        </div>

        {/* Circular Progress */}
        <div className="relative w-48 h-48 mx-auto mt-5">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-white/10"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
            />
            <circle
              className="text-purple-500"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeLinecap="round"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${(timeLeft.days / 365) * 283} 283`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {Math.floor((timeLeft.days / 365) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer2;