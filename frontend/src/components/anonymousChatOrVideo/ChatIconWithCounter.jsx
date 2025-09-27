import React from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function ChatIconWithCounter({ count = 0, onClick }) {
  return (
    <div className="relative cursor-pointer" onClick={onClick}>
      <div className="bg-indigo-600 rounded-full p-4 text-white hover:bg-indigo-700 transition-colors">
        <ChatBubbleLeftRightIcon className="h-8 w-8" />
      </div>
      {count > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-600 text-xs font-bold text-white transform translate-x-1/4 -translate-y-1/4">
          {count}
        </span>
      )}
    </div>
  );
}