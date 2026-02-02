import React from 'react';
import { User } from '../types';
import { Users } from 'lucide-react';

interface QueueDisplayProps {
  queue: User[];
  currentUserId: string | null;
}

const QueueDisplay: React.FC<QueueDisplayProps> = ({ queue, currentUserId }) => {
  return (
    <div className="fixed bottom-0 right-8 z-50 group translate-y-[calc(100%-3rem)] hover:translate-y-0 transition-transform duration-500 ease-out">
      {/* Handle / Header */}
      <div className="bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border border-stone-100 p-4 w-64 cursor-pointer flex items-center justify-between group-hover:bg-stone-50 transition-colors">
        <div className="flex items-center gap-2 text-stone-600 font-bold">
          <Users className="w-5 h-5" />
          <span>Queue ({queue.length})</span>
        </div>
        <div className="w-12 h-1 bg-stone-300 rounded-full group-hover:bg-rose-300 transition-colors" />
      </div>

      {/* List Content */}
      <div className="bg-white border-x border-b border-stone-100 w-64 max-h-64 overflow-y-auto p-2 pb-6 shadow-xl">
        {queue.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-sm italic">
            The queue is empty.<br/>Be the first!
          </div>
        ) : (
          <ul className="space-y-1">
            {queue.map((user, idx) => (
              <li key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition-colors">
                <span className="text-xs font-bold text-stone-300 w-4">#{idx + 1}</span>
                <div className={`w-2.5 h-2.5 rounded-full ${user.avatarColor}`} />
                <span className="text-sm font-semibold text-stone-600">
                  {currentUserId && user.id === currentUserId ? 'You' : user.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default QueueDisplay;
