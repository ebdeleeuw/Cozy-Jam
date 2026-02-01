import React, { useState, useEffect, useCallback } from 'react';
import { AppState, InstrumentType, PlayerStatus, User, LoopStatus } from './types';
import { MOCK_NAMES, MOCK_COLORS, TURN_DURATION, CURRENT_USER_MOCK } from './constants';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';
import QueueDisplay from './components/QueueDisplay';
import Header from './components/Header';
import ReactionZone from './components/ReactionZone';

const App: React.FC = () => {
  // State initialization
  const [currentUser] = useState<User>(CURRENT_USER_MOCK);
  const [status, setStatus] = useState<PlayerStatus>('idle');
  const [queue, setQueue] = useState<User[]>([]);
  const [activePlayer, setActivePlayer] = useState<User | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentInstrument, setCurrentInstrument] = useState<InstrumentType>(InstrumentType.PIANO);
  const [loopStatus, setLoopStatus] = useState<LoopStatus>('inactive');
  const [midiConnected, setMidiConnected] = useState(false);

  // Helper to generate a random bot user
  const generateRandomUser = (): User => ({
    id: Math.random().toString(36).substr(2, 9),
    name: MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)],
    avatarColor: MOCK_COLORS[Math.floor(Math.random() * MOCK_COLORS.length)]
  });

  // --- Game Loop Simulation ---

  // Timer simulation
  useEffect(() => {
    let interval: number;
    if (activePlayer && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (activePlayer && timeRemaining === 0) {
      // Turn ended
      handleTurnEnd();
    }
    return () => clearInterval(interval);
  }, [activePlayer, timeRemaining]);

  // Initial fake population of queue for demo purposes
  useEffect(() => {
    const initialQueue = [generateRandomUser(), generateRandomUser()];
    setQueue(initialQueue);
    // Start with someone playing
    const firstPlayer = generateRandomUser();
    setActivePlayer(firstPlayer);
    setTimeRemaining(TURN_DURATION);

    // Simulate MIDI connection after a delay
    setTimeout(() => {
        setMidiConnected(true);
    }, 2000);
  }, []);

  // --- Handlers ---

  const handleTurnEnd = useCallback(() => {
    // Logic to rotate players
    const nextPlayer = queue.length > 0 ? queue[0] : null;
    const newQueue = queue.slice(1); // Remove next player from queue

    // If current player was me, I go back to idle
    if (activePlayer?.id === currentUser.id) {
      setStatus('idle');
      setLoopStatus('inactive'); // Reset loop state
    }

    // Update active player
    setActivePlayer(nextPlayer);
    setQueue(newQueue);
    
    // Check if *I* am the next player
    if (nextPlayer && nextPlayer.id === currentUser.id) {
      setStatus('playing');
    }

    // Reset Timer
    if (nextPlayer) {
      setTimeRemaining(TURN_DURATION);
    } else {
      setTimeRemaining(0); // Silence
    }
  }, [queue, activePlayer, currentUser.id]);

  const handleJoinQueue = () => {
    setStatus('queued');
    // Add me to the end of the queue
    setQueue((prev) => [...prev, currentUser]);
  };

  const handleLeaveQueue = () => {
    setStatus('idle');
    setQueue((prev) => prev.filter(u => u.id !== currentUser.id));
  };

  // Loop Handlers
  const handleStartLoop = () => {
    setLoopStatus('recording');
  };

  const handleCommitLoop = () => {
    setLoopStatus('playing');
  };

  const handleClearLoop = () => {
    setLoopStatus('inactive');
  };

  const myQueuePosition = queue.findIndex(u => u.id === currentUser.id) + 1;

  return (
    <div className="min-h-screen bg-cozy-cream font-sans text-cozy-dark relative overflow-hidden selection:bg-rose-100">
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 bg-grain pointer-events-none z-0" />

      <Header 
        activePlayer={activePlayer} 
        timeRemaining={timeRemaining} 
        midiConnected={midiConnected}
      />

      <main className="flex flex-col items-center justify-center min-h-screen p-4 pb-24 relative z-10">
        
        {/* The visual center of the app */}
        <div className="mb-8 relative">
          <Visualizer 
            activePlayer={activePlayer} 
            status={status}
          />
        </div>

        {/* User Interaction Layer */}
        <div className="z-20">
          <Controls 
            status={status}
            currentInstrument={currentInstrument}
            loopStatus={loopStatus}
            onJoinQueue={handleJoinQueue}
            onLeaveQueue={handleLeaveQueue}
            onSetInstrument={setCurrentInstrument}
            onStartLoop={handleStartLoop}
            onCommitLoop={handleCommitLoop}
            onClearLoop={handleClearLoop}
            queuePosition={myQueuePosition}
          />
        </div>

      </main>

      {/* Floating UI Elements */}
      <ReactionZone canReact={status !== 'playing'} />
      <QueueDisplay queue={queue} />
      
      {/* Decorative background blobs */}
      <div className="fixed top-1/4 left-10 w-64 h-64 bg-cozy-green rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-breathe pointer-events-none" />
      <div className="fixed bottom-1/4 right-10 w-72 h-72 bg-cozy-pink rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-breathe pointer-events-none" style={{ animationDelay: '2s' }} />

    </div>
  );
};

export default App;