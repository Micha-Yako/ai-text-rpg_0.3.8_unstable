
import React from 'react';
import { DocumentTextIcon } from './Icons';

interface SettingsPanelProps {
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  customGameRules: string;
  setCustomGameRules: (rules: string) => void;
  onRestartChatWithNewSystemPrompt: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  systemPrompt,
  setSystemPrompt,
  customGameRules,
  setCustomGameRules,
  onRestartChatWithNewSystemPrompt,
}) => {
  return (
    <div className="bg-slate-800 p-3 sm:p-4 shadow-xl flex flex-col h-full overflow-y-auto"> 
        <div className="px-1 sm:px-0 pb-1 sm:pb-0"> 
          <div>
            <div className="mb-5">
              <label htmlFor="systemPrompt" className="block text-sm font-medium text-slate-300 mb-1">
                AI System Prompt (Persona & Core Instructions)
              </label>
              <textarea
                id="systemPrompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={10}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:ring-sky-500 focus:border-sky-500 text-sm"
                placeholder="e.g., You are a wise old wizard..."
              />
              <button
                onClick={onRestartChatWithNewSystemPrompt}
                className="mt-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md text-sm transition-colors w-full"
              >
                Apply System Prompt & Restart Game
              </button>
              <p className="text-xs text-slate-400 mt-1">Requires a game restart to change the AI's core persona and rules.</p>
            </div>

            <div>
              <label htmlFor="gameRules" className="block text-sm font-medium text-slate-300 mb-1">
                Custom Game Rules & Context
              </label>
              <textarea
                id="gameRules"
                value={customGameRules}
                onChange={(e) => setCustomGameRules(e.target.value)}
                rows={12}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:ring-sky-500 focus:border-sky-500 text-sm"
                placeholder="e.g., Magic is rare. Player is allergic to cats."
              />
              <p className="text-xs text-slate-400 mt-1">This context is sent to the AI with every message.</p>
            </div>
          </div>
        </div>
    </div>
  );
};

export default SettingsPanel;
