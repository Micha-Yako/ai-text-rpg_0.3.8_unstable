
import React from 'react';
import { Item } from '../types';
import { BoxIcon } from './Icons';

interface InventoryPanelProps {
  items: Item[];
  capacity: number;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ items, capacity }) => {
  const unequippedItems = items.filter(item => !item.isEquipped);
  const totalSize = unequippedItems.reduce((sum, item) => sum + (item.size || 1) * item.quantity, 0);

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-xl h-full flex flex-col overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-amber-400 flex items-center">
        <BoxIcon className="w-6 h-6 mr-2" /> Inventory ({totalSize}/{capacity})
      </h2>
      {unequippedItems.length === 0 ? (
        <p className="text-slate-400 italic">Your inventory is empty.</p>
      ) : (
        <ul className="space-y-3">
          {unequippedItems.map((item) => (
            <li key={item.id} className="p-3 bg-slate-700 rounded-md shadow">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-100">{item.name}</span>
                <div className="flex items-center gap-2">
                    {item.size > 1 && <span className="text-xs text-slate-400">Sz: {item.size}</span>}
                    {item.quantity > 1 && <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded-full">x{item.quantity}</span>}
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-1">{item.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InventoryPanel;
