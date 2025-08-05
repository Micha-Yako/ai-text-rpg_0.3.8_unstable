
import React, { useState } from 'react';
import { SendIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, placeholder }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-slate-800 border-t border-slate-700 rounded-b-lg">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder || "What do you do next?"}
          className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
