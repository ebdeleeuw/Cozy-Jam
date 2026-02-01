import React from 'react';
import { InstrumentType, PlayerStatus, LoopStatus } from '../types';
import { Music, Disc, Mic, Hand, Play, Square, Trash2, Check, Radio } from 'lucide-react';

interface ControlsProps {
  status: PlayerStatus;
  currentInstrument: InstrumentType;
  loopStatus: LoopStatus;
  onJoinQueue: () => void;
  onLeaveQueue: () => void;
  onSetInstrument: (inst: InstrumentType) => void;
  onStartLoop: () => void;
  onCommitLoop: () => void;
  onClearLoop: () => void;
  queuePosition: number;
}

const Controls: React.FC<ControlsProps> = ({
  status,
  currentInstrument,
  loopStatus,
  onJoinQueue,
  onLeaveQueue,
  onSetInstrument,
  onStartLoop,
  onCommitLoop,
  onClearLoop,
  queuePosition
}) => {
  if (status === 'idle') {
    return (
      <button 
        onClick={onJoinQueue}
        className="
          flex items-center gap-3 px-8 py-4 
          bg-cozy-dark text-white rounded-full 
          shadow-lg hover:shadow-xl hover:-translate-y-1 
          transition-all duration-300 font-bold text-lg
        "
      >
        <Hand className="w-6 h-6" />
        Join the Jam
      </button>
    );
  }

  if (status === 'queued') {
    return (
      <div className="flex flex-col items-center gap-3 animate-fade-in">
        <div className="px-6 py-3 bg-white rounded-full shadow-sm border border-stone-200 text-stone-600 font-semibold flex items-center gap-2">
          <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
          Waiting in line... (#{queuePosition})
        </div>
        <button 
          onClick={onLeaveQueue}
          className="text-stone-400 text-sm hover:text-stone-600 underline decoration-stone-300 underline-offset-4 transition-colors"
        >
          Leave Queue
        </button>
      </div>
    );
  }

  // Status is 'playing'
  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in-up">
      <div className="flex items-center p-2 rounded-3xl shadow-lg border border-stone-100 bg-white">
        
        {/* Instrument Section */}
        <div className="flex items-center gap-1 mr-2">
          <ControlToggle 
            isActive={currentInstrument === InstrumentType.PIANO} 
            onClick={() => onSetInstrument(InstrumentType.PIANO)}
            label="Piano"
            icon={<Music className="w-5 h-5" />}
          />
          <ControlToggle 
            isActive={currentInstrument === InstrumentType.DRUMS} 
            onClick={() => onSetInstrument(InstrumentType.DRUMS)}
            label="Drums"
            icon={<Disc className="w-5 h-5" />}
          />
          <ControlToggle 
            isActive={currentInstrument === InstrumentType.SYNTH} 
            onClick={() => onSetInstrument(InstrumentType.SYNTH)}
            label="Synth"
            icon={<Mic className="w-5 h-5" />}
          />
        </div>
        
        <div className="w-px h-10 bg-stone-200 mx-2" />

        {/* Loop Section */}
        <div className="flex items-center pl-1">
          {loopStatus === 'inactive' && (
            <button
              onClick={onStartLoop}
              className="
                flex flex-col items-center justify-center w-20 py-3 rounded-2xl gap-1 transition-all duration-200
                hover:bg-rose-50 text-stone-500 hover:text-rose-600
              "
            >
              <div className="w-5 h-5 border-2 border-current rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-current rounded-full" />
              </div>
              <span className="text-xs font-bold">Rec Loop</span>
            </button>
          )}

          {loopStatus === 'recording' && (
             <button
              onClick={onCommitLoop}
              className="
                flex flex-col items-center justify-center w-24 py-3 rounded-2xl gap-1 transition-all duration-200
                bg-rose-500 text-white shadow-md animate-pulse
              "
            >
              <Check className="w-5 h-5" />
              <span className="text-xs font-bold">Finish</span>
            </button>
          )}

          {loopStatus === 'playing' && (
            <div className="flex items-center gap-2 pr-2">
               <div className="flex flex-col items-center justify-center px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5">Looping</span>
                  <div className="w-12 h-1 bg-emerald-200 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-1/2 animate-[wiggle_2s_linear_infinite]" />
                  </div>
               </div>
               <button
                  onClick={onClearLoop}
                  className="p-3 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Clear Loop"
                >
                  <Trash2 className="w-5 h-5" />
               </button>
            </div>
          )}
        </div>
      </div>

      <div className="text-stone-400 text-sm font-medium flex items-center gap-2">
        {loopStatus === 'recording' ? (
           <span className="text-rose-500 flex items-center gap-2 animate-pulse">
             <Radio className="w-4 h-4" /> Recording notes...
           </span>
        ) : (
           "Play your MIDI controller now!"
        )}
      </div>
    </div>
  );
};

// Helper sub-component
const ControlToggle = ({ isActive, onClick, label, icon }: { isActive: boolean, onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center w-20 py-3 rounded-2xl gap-1 transition-all duration-200
      ${isActive 
        ? 'bg-cozy-blue text-blue-900 shadow-inner translate-y-0.5' 
        : 'hover:bg-stone-50 text-stone-500 hover:-translate-y-0.5'}
    `}
  >
    {icon}
    <span className="text-xs font-bold">{label}</span>
  </button>
);

export default Controls;
