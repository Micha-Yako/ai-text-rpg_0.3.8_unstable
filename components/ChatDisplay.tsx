
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { UserCircleIcon, SparklesIcon } from './Icons';

interface ChatDisplayProps {
  messages: ChatMessage[];
  isLoading: boolean;
  chatType: 'story' | 'system'; // New prop
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({ messages, isLoading, chatType }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className={`flex-grow p-4 space-y-4 overflow-y-auto ${chatType === 'story' ? 'bg-slate-800' : 'bg-slate-800'} rounded-t-lg`}>
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-xl p-3 rounded-xl shadow ${
            msg.sender === 'user' ? 'bg-sky-600 text-white' : 
            msg.sender === 'ai' ? 'bg-slate-700 text-slate-200' :
            msg.sender === 'system' && chatType === 'story' ? 'bg-yellow-600/80 text-white italic text-center mx-auto' : // System messages in story chat
            'bg-slate-600 text-slate-300' // System messages in system log
          }`}>
            {chatType === 'story' && (
              <div className="flex items-center mb-1">
                {msg.sender === 'user' && <UserCircleIcon className="w-5 h-5 mr-2" />}
                {msg.sender === 'ai' && <SparklesIcon className="w-5 h-5 mr-2 text-purple-400" />}
                {/* No icon for system messages in story chat, handled by centering */}
                <span className={`font-semibold text-sm ${msg.sender === 'system' ? 'w-full text-center' : ''}`}>
                  {msg.sender === 'user' ? 'You' : msg.sender === 'ai' ? 'Game Master (AI)' : 'System Event'}
                </span>
              </div>
            )}
            <p className={`text-sm whitespace-pre-wrap ${chatType === 'system' ? 'font-mono text-xs' : ''}`}>{msg.text}</p>
            <p className={`text-xs opacity-70 mt-1 ${chatType === 'system' ? 'text-left' : 'text-right'}`}>
              {msg.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
      {isLoading && chatType === 'story' && ( // Only show "typing..." in story chat
        <div className="flex justify-start">
          <div className="max-w-xl p-3 rounded-lg shadow bg-slate-700 text-slate-200">
            <div className="flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2 text-purple-400 animate-pulse" />
              <span className="font-semibold text-sm">Game Master (AI) is typing...</span>
            </div>
          </div>
        </div>
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatDisplay;
