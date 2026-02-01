import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Zap, Sparkles, Music2 } from 'lucide-react';

interface Reaction {
  id: number;
  emoji: string;
  left: number; // percentage 0-100
  bottom: number; // percentage offset
  duration: number; // seconds
  scale: number;
  wobble: number; // -1 or 1 for direction
}

interface ReactionZoneProps {
  canReact: boolean;
}

const EMOJIS = [
  { icon: Heart, label: 'Love', color: 'text-rose-500', bg: 'bg-rose-100', emoji: '❤️' },
  { icon: Zap, label: 'Energy', color: 'text-amber-500', bg: 'bg-amber-100', emoji: '⚡' },
  { icon: Sparkles, label: 'Vibe', color: 'text-purple-500', bg: 'bg-purple-100', emoji: '✨' },
  { icon: Music2, label: 'Jam', color: 'text-blue-500', bg: 'bg-blue-100', emoji: '🎵' },
];

const ReactionZone: React.FC<ReactionZoneProps> = ({ canReact }) => {
  const [particles, setParticles] = useState<Reaction[]>([]);

  const spawnParticle = useCallback((emoji: string, burst = false) => {
    const id = Date.now() + Math.random();
    
    // Spread logic: 
    // If burst (user click), spread 10-90% width.
    // If passive (auto), spread 20-80% width.
    const min = burst ? 10 : 20;
    const max = burst ? 90 : 80;
    const left = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Randomize physics
    const duration = 2 + Math.random() * 2; // 2s to 4s
    const scale = 0.8 + Math.random() * 0.7; // 0.8x to 1.5x
    const wobble = Math.random() > 0.5 ? 1 : -1;
    const bottom = Math.random() * 20; // Start slightly varying heights

    setParticles(prev => [...prev, { id, emoji, left, bottom, duration, scale, wobble }]);

    // Cleanup
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, duration * 1000);
  }, []);

  const handleReactionClick = (emoji: string) => {
    // Spawn a "burst" of particles for satisfying density
    const count = 3 + Math.floor(Math.random() * 3); // 3 to 5 particles
    for (let i = 0; i < count; i++) {
      setTimeout(() => spawnParticle(emoji, true), i * 150);
    }
  };

  // Passive ambient reactions
  useEffect(() => {
    const interval = setInterval(() => {
       if (Math.random() > 0.7) {
         const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)].emoji;
         spawnParticle(randomEmoji, false);
       }
    }, 1500);
    return () => clearInterval(interval);
  }, [spawnParticle]);

  return (
    <>
      {/* 1. Full Screen Particle Layer (Pointer events none allows clicking through) */}
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bottom-0 text-2xl animate-float-up opacity-0"
            style={{ 
              left: `${p.left}%`,
              bottom: `${p.bottom}%`,
              fontSize: `${p.scale}rem`,
              animationDuration: `${p.duration}s`,
              transform: `rotate(${p.wobble * 15}deg)`,
              // We override the default animation timing to make it distinct per particle
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* 2. Docked Action Bar (Bottom Left) */}
      {canReact && (
        <div className="fixed bottom-8 left-8 z-50 animate-fade-in-up">
           <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100">
            {EMOJIS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleReactionClick(item.emoji)}
                className={`
                  p-3 rounded-xl transition-all duration-200 
                  hover:-translate-y-1 hover:shadow-lg hover:scale-105 active:scale-95
                  ${item.bg} ${item.color}
                `}
                title={`Send ${item.label}`}
              >
                <item.icon className="w-5 h-5" />
              </button>
            ))}
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-full">
              Send Love
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default ReactionZone;