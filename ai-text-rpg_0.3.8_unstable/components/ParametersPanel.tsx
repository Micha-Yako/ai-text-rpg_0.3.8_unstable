
import React from 'react';
import { PlayerParameter } from '../types';
import { UserCircleIcon } from './Icons';

interface ParametersPanelProps {
  parameters: PlayerParameter[];
}

const ParametersPanel: React.FC<ParametersPanelProps> = ({ parameters }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-xl h-full flex flex-col overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-emerald-400 flex items-center">
        <UserCircleIcon className="w-6 h-6 mr-2" /> Player Status
      </h2>
      {parameters.length === 0 ? (
        <p className="text-slate-400 italic">No parameters defined.</p>
      ) : (
        <ul className="space-y-2">
          {parameters.map((param) => (
            <li key={param.id} className="p-3 bg-slate-700 rounded-md shadow flex justify-between items-center">
              <span className="font-medium text-slate-200">{param.name}:</span>
              <span className="text-slate-100 font-semibold">{String(param.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ParametersPanel;
