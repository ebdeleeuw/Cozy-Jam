export type PlayerStatus = 'idle' | 'queued' | 'playing';
export type LoopStatus = 'inactive' | 'recording' | 'playing';

export enum InstrumentType {
  PIANO = 'PIANO',
  DRUMS = 'DRUMS',
  SYNTH = 'SYNTH'
}

export interface User {
  id: string;
  name: string; // Anonymous names like "Sleepy Fox"
  avatarColor: string;
}

export interface AppState {
  currentUser: User;
  status: PlayerStatus;
  queue: User[];
  activePlayer: User | null;
  timeRemaining: number; // Seconds
  currentInstrument: InstrumentType;
  loopStatus: LoopStatus;
}

export interface ServerState {
  queue: User[];
  activePlayer: User | null;
  timeRemaining: number;
  currentInstrument: InstrumentType;
}
