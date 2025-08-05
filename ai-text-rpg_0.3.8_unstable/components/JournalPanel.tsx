import React, { useState } from 'react';
import { Quest, CharacterNote } from '../types';
import { BookOpenIcon, UserCircleIcon } from './Icons';

interface JournalPanelProps {
  quests: Quest[];
  characterNotes: CharacterNote[];
}

type ActiveTab = 'quests' | 'characters';

const JournalPanel: React.FC<JournalPanelProps> = ({ quests, characterNotes }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('quests');

  const getStatusColor = (status: Quest['status']) => {
    switch (status) {
      case 'active': return 'text-yellow-400';
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-xl h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-2 text-rose-400 flex items-center">
        <BookOpenIcon className="w-6 h-6 mr-2" /> Journal
      </h2>
      
      {/* Tabs */}
      <div className="mb-4 border-b border-slate-700 flex-shrink-0">
        <nav className="flex space-x-2" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('quests')}
            className={`
              ${activeTab === 'quests' ? 'bg-slate-700 text-rose-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}
              px-3 py-2 font-medium text-sm rounded-t-md flex items-center transition-colors
            `}
            aria-current={activeTab === 'quests' ? 'page' : undefined}
          >
            Quests ({quests.length})
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={`
              ${activeTab === 'characters' ? 'bg-slate-700 text-rose-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}
              px-3 py-2 font-medium text-sm rounded-t-md flex items-center transition-colors
            `}
            aria-current={activeTab === 'characters' ? 'page' : undefined}
          >
            Characters ({characterNotes.length})
          </button>
        </nav>
      </div>

      <div className="flex-grow overflow-y-auto pr-1">
        {activeTab === 'quests' && (
          <div>
            {quests.length === 0 ? (
              <p className="text-slate-400 italic">No active quests.</p>
            ) : (
              <ul className="space-y-4">
                {quests.map((quest) => (
                  <li key={quest.id} className="p-3 bg-slate-700/80 rounded-md shadow">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-base text-slate-100">{quest.title}</span>
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${getStatusColor(quest.status)} bg-slate-600`}>
                        {quest.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mt-1.5">{quest.description}</p>
                    {quest.reward && (
                        <p className="text-sm text-amber-400 mt-2">
                            <span className="font-semibold">Reward:</span> {quest.reward}
                        </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'characters' && (
          <div>
            {characterNotes.length === 0 ? (
              <p className="text-slate-400 italic">No notes on important characters yet.</p>
            ) : (
              <ul className="space-y-3">
                {characterNotes.map((note) => (
                  <li key={note.id} className="p-3 bg-slate-700 rounded-md shadow">
                    <div className="flex items-center">
                      <UserCircleIcon className="w-5 h-5 mr-2 text-slate-400" />
                      <span className="font-medium text-slate-100">{note.name}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1 pl-7">{note.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalPanel;
