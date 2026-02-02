import React, { useEffect, useMemo, useRef, useState } from 'react';
import { InstrumentType, LoopStatus, PlayerStatus, ServerState, User } from './types';
import { TURN_DURATION, WS_URL } from './constants';
import { SynthEngine } from './src/audio/synth';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';
import QueueDisplay from './components/QueueDisplay';
import Header from './components/Header';
import ReactionZone from './components/ReactionZone';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [serverState, setServerState] = useState<ServerState>({
    queue: [],
    activePlayer: null,
    timeRemaining: 0,
    currentInstrument: InstrumentType.PIANO,
  });
  const [loopStatus, setLoopStatus] = useState<LoopStatus>('inactive');
  const [midiConnected, setMidiConnected] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);
  const pendingJoin = useRef<boolean>(false);
  const synthRef = useRef<SynthEngine | null>(null);
  const statusRef = useRef<PlayerStatus>('idle');
  const instrumentRef = useRef<InstrumentType>(InstrumentType.PIANO);

  useEffect(() => {
    let cancelled = false;

    const connect = () => {
      setWsStatus('connecting');
      const ws = new WebSocket(WS_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        setWsStatus('open');
        if (pendingJoin.current) {
          ws.send(JSON.stringify({ type: 'joinQueue' }));
          pendingJoin.current = false;
        }
      };

      ws.onmessage = (event) => {
        let message: any;
        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }

        if (message.type === 'hello') {
          setCurrentUser(message.you);
          return;
        }

        if (message.type === 'state') {
          setServerState(message.state as ServerState);
          if (message.you?.loopStatus) {
            setLoopStatus(message.you.loopStatus as LoopStatus);
          }
          return;
        }

        if (message.type === 'note') {
          const { note, velocity, on, instrument, from } = message;
          if (typeof note !== 'number' || typeof velocity !== 'number') return;
          if (!synthRef.current) synthRef.current = new SynthEngine();
          const synth = synthRef.current;
          const ctx = synth.ensureContext();
          const buffer = 0.06;
          const when = ctx.currentTime + buffer;

          if (currentUser && from === currentUser.id) return;

          if (on) {
            synth.noteOn(note, velocity, instrument, when);
          } else {
            synth.noteOff(note, when);
          }
        }
      };

      ws.onclose = () => {
        if (cancelled) return;
        setWsStatus('closed');
        socketRef.current = null;
        if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
        reconnectTimer.current = window.setTimeout(connect, 1200);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
      socketRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!('requestMIDIAccess' in navigator)) {
      setMidiConnected(false);
      return;
    }

    const handleMidiMessage = (event: any) => {
      const data = event.data as Uint8Array;
      if (!data || data.length < 3) return;
      const command = data[0] & 0xf0;
      const note = data[1];
      const velocity = data[2] / 127;

      if (statusRef.current !== 'playing') return;

      if (!synthRef.current) synthRef.current = new SynthEngine();
      const synth = synthRef.current;

      if (command === 0x90 && velocity > 0) {
        synth.resume();
        synth.noteOn(note, velocity, instrumentRef.current);
        send({ type: 'note', note, velocity, on: true });
      } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
        synth.noteOff(note);
        send({ type: 'note', note, velocity: 0, on: false });
      }
    };

    const attachInputs = (access: any) => {
      const inputs = access.inputs.values();
      let hasAny = false;
      for (const input of inputs) {
        hasAny = true;
        input.onmidimessage = handleMidiMessage;
      }
      setMidiConnected(hasAny);
    };

    (navigator as any)
      .requestMIDIAccess()
      .then((access: any) => {
        attachInputs(access);
        access.onstatechange = () => attachInputs(access);
      })
      .catch(() => setMidiConnected(false));
  }, []);

  useEffect(() => {
    const keyToNote: Record<string, number> = {
      a: 60,
      w: 61,
      s: 62,
      e: 63,
      d: 64,
      f: 65,
      t: 66,
      g: 67,
      y: 68,
      h: 69,
      u: 70,
      j: 71,
      k: 72,
    };

    const down = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      const note = keyToNote[key];
      if (note == null) return;
      if (statusRef.current !== 'playing') return;
      if (down.has(key)) return;
      down.add(key);

      if (!synthRef.current) synthRef.current = new SynthEngine();
      const synth = synthRef.current;
      synth.resume();
      synth.noteOn(note, 0.7, instrumentRef.current);
      send({ type: 'note', note, velocity: 0.7, on: true });
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const note = keyToNote[key];
      if (note == null) return;
      if (down.has(key)) down.delete(key);
      if (!synthRef.current) synthRef.current = new SynthEngine();
      const synth = synthRef.current;
      synth.noteOff(note);
      send({ type: 'note', note, velocity: 0, on: false });
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const status: PlayerStatus = useMemo(() => {
    if (!currentUser) return 'idle';
    if (serverState.activePlayer?.id === currentUser.id) return 'playing';
    if (serverState.queue.some((u) => u.id === currentUser.id)) return 'queued';
    return 'idle';
  }, [currentUser, serverState]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    instrumentRef.current = serverState.currentInstrument;
  }, [serverState.currentInstrument]);

  const queuePosition = useMemo(() => {
    if (!currentUser) return 0;
    return serverState.queue.findIndex((u) => u.id === currentUser.id) + 1;
  }, [currentUser, serverState.queue]);

  const send = (payload: Record<string, unknown>) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(payload));
    return true;
  };

  const handleJoinQueue = () => {
    const sent = send({ type: 'joinQueue' });
    if (!sent) {
      pendingJoin.current = true;
      setWsStatus('connecting');
    }
  };
  const handleLeaveQueue = () => send({ type: 'leaveQueue' });
  const handleSetInstrument = (inst: InstrumentType) => send({ type: 'setInstrument', instrument: inst });
  const handleStartLoop = () => send({ type: 'loopStart' });
  const handleCommitLoop = () => send({ type: 'loopCommit' });
  const handleClearLoop = () => send({ type: 'loopClear' });

  return (
    <div className="min-h-screen bg-cozy-cream font-sans text-cozy-dark relative overflow-hidden selection:bg-rose-100">
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 bg-grain pointer-events-none z-0" />

      <Header
        activePlayer={serverState.activePlayer}
        timeRemaining={serverState.timeRemaining}
        midiConnected={midiConnected}
        wsStatus={wsStatus}
      />

      <main className="flex flex-col items-center justify-center min-h-screen p-4 pb-24 relative z-10">
        {/* The visual center of the app */}
        <div className="mb-8 relative">
          <Visualizer activePlayer={serverState.activePlayer} status={status} />
        </div>

        {/* User Interaction Layer */}
        <div className="z-20">
          <Controls
            status={status}
            currentInstrument={serverState.currentInstrument}
            loopStatus={loopStatus}
            onJoinQueue={handleJoinQueue}
            onLeaveQueue={handleLeaveQueue}
            onSetInstrument={handleSetInstrument}
            onStartLoop={handleStartLoop}
            onCommitLoop={handleCommitLoop}
            onClearLoop={handleClearLoop}
            queuePosition={queuePosition}
          />
        </div>
      </main>

      {/* Floating UI Elements */}
      <ReactionZone canReact={status !== 'playing'} />
      <QueueDisplay queue={serverState.queue} />

      {/* Decorative background blobs */}
      <div className="fixed top-1/4 left-10 w-64 h-64 bg-cozy-green rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-breathe pointer-events-none" />
      <div
        className="fixed bottom-1/4 right-10 w-72 h-72 bg-cozy-pink rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-breathe pointer-events-none"
        style={{ animationDelay: '2s' }}
      />

      {/* Footer note */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 text-xs text-stone-400 z-10">
        {TURN_DURATION}s rotation • First-come, first-served • Anonymous only
      </footer>
    </div>
  );
};

export default App;
