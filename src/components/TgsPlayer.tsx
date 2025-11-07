// components/TgsPlayer.tsx
'use client';

import React, { useEffect, useRef } from 'react';
// Import the library; it handles registering the custom element
import "@lottiefiles/lottie-player";

interface TgsPlayerProps {
  src: string; // The path or URL to your TGS file
  loop?: boolean;
  autoplay?: boolean;
}

const TgsPlayer: React.FC<TgsPlayerProps> = ({ src, loop = true, autoplay = true }) => {
  const playerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Ensure the custom element is recognized if using TypeScript
    if (playerRef.current) {
        // You can use player methods here if needed, e.g., playerRef.current.load(src);
    }
  }, [src]);

  // Use the <tgs-player> custom element
  return (
    <tgs-player
      ref={playerRef}
      src={src}
      loop={loop}
      autoplay={autoplay}
      mode="normal"
      style={{ width: '300px', height: '300px' }} // Example styling
    />
  );
};

export default TgsPlayer;
