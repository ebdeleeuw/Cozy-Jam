import { User } from './types';

export const TURN_DURATION = 30; // Seconds

export const MOCK_NAMES = [
  "Sleepy Fox", "Cozy Bear", "Gentle Cat", "Warm Tea", 
  "Soft Cloud", "Quiet Owl", "Mellow Moon", "Calm Leaf"
];

export const MOCK_COLORS = [
  "bg-rose-200", "bg-sky-200", "bg-emerald-200", "bg-amber-200", "bg-violet-200"
];

export const CURRENT_USER_MOCK: User = {
  id: 'me',
  name: 'You',
  avatarColor: 'bg-cozy-dark text-white'
};
