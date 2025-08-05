import React from 'react';
import { Item, ItemEffect } from '../types';
import { ShieldCheckIcon } from './Icons';

interface EquipmentPanelProps {
  items: Item[];
}

const EquipmentPanel: React.FC<EquipmentPanelProps> = ({ items }) => {
  const equippedItems = items.filter(item => item.isEquipped);

  const renderEffect = (effect: ItemEffect) => {
      if (!effect) return null;
      switch (effect.type) {
          case 'capacity_modifier':
              return `Increases inventory capacity by ${effect.value}.`;
          default:
              return `Unknown effect.`;
      }
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-xl h-full flex flex-col overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-teal-400 flex items-center">
        <ShieldCheckIcon className="w-6 h-6 mr-2" /> Equipment
      </h2>
      {equippedItems.length === 0 ? (
        <p className="text-slate-400 italic">Nothing is equipped.</p>
      ) : (
        <ul className="space-y-3">
          {equippedItems.map((item) => (
            <li key={item.id} className="p-3 bg-slate-700 rounded-md shadow">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-100">{item.name}</span>
                {item.quantity > 1 && <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded-full">x{item.quantity}</span>}
              </div>
              <p className="text-sm text-slate-400 mt-1">{item.description}</p>
              {item.effects && item.effects.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-600/50">
                      {item.effects.map((effect, index) => (
                          <p key={index} className="text-xs text-cyan-300">
                              Effect: {renderEffect(effect)}
                          </p>
                      ))}
                  </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EquipmentPanel;
