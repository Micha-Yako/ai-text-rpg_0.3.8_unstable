import React from 'react';
import { StatusEffect } from '../types';
import { SparklesIcon } from './Icons'; // Using SparklesIcon for now

interface StatusEffectsPanelProps {
  effects: StatusEffect[];
}

const StatusEffectsPanel: React.FC<StatusEffectsPanelProps> = ({ effects }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-xl h-full flex flex-col overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-cyan-400 flex items-center">
        <SparklesIcon className="w-6 h-6 mr-2" /> Active Effects
      </h2>
      {effects.length === 0 ? (
        <p className="text-slate-400 italic">No active status effects.</p>
      ) : (
        <ul className="space-y-3">
          {effects.map((effect) => (
            <li key={effect.id} className="p-3 bg-slate-700 rounded-md shadow">
              <div className="flex justify-between items-center">
                <span className={`font-medium ${effect.modifier >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {effect.name}
                </span>
                <span className="text-xs text-slate-300">
                    {effect.duration === -1 ? 'Permanent' : `${effect.duration} turns left`}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">{effect.description}</p>
              <p className="text-sm font-mono text-cyan-300 mt-1">
                {effect.modifier > 0 ? '+' : ''}{effect.modifier} to {effect.targetParameterName} per turn
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StatusEffectsPanel;
