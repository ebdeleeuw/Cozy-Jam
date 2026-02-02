import React, { useEffect, useState } from 'react';
import { PlayerStatus, User } from '../types';

interface VisualizerProps {
  activePlayer: User | null;
  status: PlayerStatus;
  pulseSignal: { id: number; velocity: number };
}

const Visualizer: React.FC<VisualizerProps> = ({ activePlayer, status, pulseSignal }) => {
  const [scale, setScale] = useState(1);
  const hasSignal = Boolean(activePlayer) || status === 'playing';

  useEffect(() => {
    if (!hasSignal) {
      setScale(1);
      return;
    }

    const strength = 1 + pulseSignal.velocity * 0.3;
    setScale(strength);
    const t = window.setTimeout(() => setScale(1), 180);
    return () => window.clearTimeout(t);
  }, [pulseSignal, hasSignal]);

  const isMePlaying = status === 'playing';
  const colorClass = activePlayer ? activePlayer.avatarColor.replace('text-white', '') : 'bg-gray-200';
  const colorTextClass = activePlayer ? activePlayer.avatarColor.replace('bg-', 'text-') : 'text-gray-300';

  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-96 md:h-96 transition-all duration-700">
      {/* Outer ambient glow */}
      <div 
        className={`absolute inset-0 rounded-full blur-3xl opacity-30 transition-colors duration-1000 ${colorClass}`} 
        style={{ transform: `scale(${scale * 1.5})` }}
      />

      {/* Pulse ring (note hit) */}
      {hasSignal && (
        <div
          key={pulseSignal.id}
          className={`absolute inset-0 rounded-full border-2 ${colorTextClass} animate-pulse-ring`}
          style={{
            borderColor: 'currentColor',
            opacity: 0.5,
          }}
        />
      )}

      {/* Main Pulse Circle */}
      <div 
        className={`
          relative z-10 w-48 h-48 md:w-64 md:h-64 rounded-full shadow-xl 
          flex items-center justify-center transition-transform duration-200
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
          <div className={`absolute w-full h-full animate-spin-slow opacity-40 pointer-events-none ${colorTextClass}`}>
             <div className={`absolute top-0 left-1/2 w-4 h-4 rounded-full -translate-x-1/2 -translate-y-12 ${colorClass}`} />
          </div>
          <div className={`absolute w-3/4 h-3/4 animate-spin-reverse-slow opacity-30 pointer-events-none border-2 border-dashed border-current rounded-full ${colorTextClass}`} />
        </>
      )}
    </div>
  );
};

export default Visualizer;