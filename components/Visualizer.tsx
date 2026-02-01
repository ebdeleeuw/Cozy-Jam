import React, { useEffect, useState } from 'react';
import { PlayerStatus, User } from '../types';

interface VisualizerProps {
  activePlayer: User | null;
  status: PlayerStatus;
}

const Visualizer: React.FC<VisualizerProps> = ({ activePlayer, status }) => {
  const [scale, setScale] = useState(1);
  
  // Simulate some visual activity when playing
  useEffect(() => {
    if (!activePlayer) return;

    const interval = setInterval(() => {
      // Random gentle fluctuation to simulate music
      const randomScale = 0.95 + Math.random() * 0.15;
      setScale(randomScale);
    }, 400);

    return () => clearInterval(interval);
  }, [activePlayer]);

  const isMePlaying = status === 'playing';

  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-96 md:h-96 transition-all duration-700">
      {/* Outer ambient glow */}
      <div 
        className={`absolute inset-0 rounded-full blur-3xl opacity-30 transition-colors duration-1000 ${
          activePlayer ? activePlayer.avatarColor.replace('text-white', '') : 'bg-gray-200'
        }`} 
        style={{ transform: `scale(${scale * 1.5})` }}
      />

      {/* Main Pulse Circle */}
      <div 
        className={`
          relative z-10 w-48 h-48 md:w-64 md:h-64 rounded-full shadow-xl 
          flex items-center justify-center transition-all duration-500
          ${activePlayer ? activePlayer.avatarColor : 'bg-gray-100'}
        `}
        style={{ transform: `scale(${scale})` }}
      >
        <div className="text-center p-4">
          {activePlayer ? (
            <div className="flex flex-col items-center gap-2">
              <span className={`text-6xl ${isMePlaying ? 'animate-bounce' : ''}`}>
                ♪
              </span>
              <span className="font-bold text-lg opacity-90 block">
                 {activePlayer.name}
              </span>
              {isMePlaying && (
                <div className="flex flex-col items-center">
                  <span className="text-xs uppercase tracking-widest opacity-75 mt-1">
                    Live Now
                  </span>
                </div>
              )}
            </div>
          ) : (
             <div className="text-gray-400 font-semibold text-lg">
               Silence...
             </div>
          )}
        </div>
      </div>

      {/* Orbiting particles (decorative) */}
      {activePlayer && (
        <>
          <div className="absolute w-full h-full animate-spin-slow opacity-40 pointer-events-none">
             <div className="absolute top-0 left-1/2 w-4 h-4 bg-current rounded-full -translate-x-1/2 -translate-y-12" />
          </div>
          <div className="absolute w-3/4 h-3/4 animate-spin-reverse-slow opacity-30 pointer-events-none border-2 border-dashed border-current rounded-full" />
        </>
      )}
    </div>
  );
};

export default Visualizer;