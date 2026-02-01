import React from 'react';
import { Clock } from 'lucide-react';
import { User } from '../types';
import MidiStatus from './MidiStatus';

interface HeaderProps {
  activePlayer: User | null;
  timeRemaining: number;
  midiConnected: boolean;
}

const Header: React.FC<HeaderProps> = ({ activePlayer, timeRemaining, midiConnected }) => {
  const progressPercent = (timeRemaining / 30) * 100;

  return (
    <header className="fixed top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-40">
      {/* Brand & Midi Status */}
      <div className="pointer-events-auto flex flex-col gap-2">
        <div>
            <h1 className="text-2xl font-extrabold text-stone-800 tracking-tight flex items-center gap-2">
            <span className="text-3xl">🎹</span> Cozy Jam
            </h1>
            <p className="text-stone-400 text-sm font-medium ml-1">Anonymous MIDI Room</p>
        </div>
        <div className="ml-1">
            <MidiStatus connected={midiConnected} />
        </div>
      </div>

      {/* Status Pill */}
      {activePlayer && (
        <div className="flex flex-col items-end gap-2 pointer-events-auto animate-slide-down">
          <div className="bg-white pl-4 pr-1 py-1 rounded-full shadow-sm border border-stone-100 flex items-center gap-3">
             <span className="text-sm font-bold text-stone-600">
               On Stage: <span className="text-stone-800">{activePlayer.name}</span>
             </span>
             <div className="bg-stone-100 rounded-full px-3 py-1.5 flex items-center gap-1.5 min-w-[70px] justify-center">
                <Clock className="w-3 h-3 text-stone-400" />
                <span className={`text-sm font-mono font-bold ${timeRemaining < 10 ? 'text-rose-500' : 'text-stone-600'}`}>
                  {timeRemaining}s
                </span>
             </div>
          </div>
          
          {/* Subtle Progress Bar */}
          <div className="w-full h-1 bg-stone-200 rounded-full overflow-hidden w-32">
            <div 
              className="h-full bg-rose-400 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;