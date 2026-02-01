import React from 'react';
import { Cable, CheckCircle2, AlertCircle } from 'lucide-react';

interface MidiStatusProps {
  connected: boolean;
}

const MidiStatus: React.FC<MidiStatusProps> = ({ connected }) => {
  return (
    <div 
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-500
        ${connected 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
          : 'bg-stone-100 border-stone-200 text-stone-400'}
      `}
    >
      <Cable className={`w-3 h-3 ${connected ? '' : 'opacity-50'}`} />
      <span>{connected ? 'MIDI Ready' : 'No Device'}</span>
      {connected ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
      ) : (
        <div className="w-2 h-2 rounded-full bg-stone-300" />
      )}
    </div>
  );
};

export default MidiStatus;