
import React from 'react';
import { 
    WindowIcon, MapIcon, ArrowPathIcon, 
    ShieldCheckIcon, BookOpenIcon, BagIcon 
} from './Icons';

interface AppHeaderProps {
  currentLocationName: string;
  isLoading: boolean;
  handleResetGame: () => void;
  activeRightPanel: 'status' | 'journal' | 'equipment';
  isRightSidePanelVisible: boolean;
  toggleRightPanel: (panel: 'status' | 'journal' | 'equipment') => void;
  toggleWorldMap: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  currentLocationName,
  isLoading,
  handleResetGame,
  activeRightPanel,
  isRightSidePanelVisible,
  toggleRightPanel,
  toggleWorldMap
}) => {
  return (
    <header className="bg-slate-800 p-2 sm:p-3 shadow-md flex justify-between items-center flex-shrink-0">
      <div className="flex items-center gap-1 sm:gap-2">
          <h1 className="text-lg sm:text-xl font-bold text-sky-400 mr-1 sm:mr-2 flex items-center">
            <WindowIcon className="w-6 h-6 mr-2 hidden sm:inline" /> AI Text Adventure
          </h1>
          {currentLocationName && (
            <div className="flex items-center text-xs sm:text-sm text-fuchsia-400 border border-fuchsia-500/50 rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1">
              <MapIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
              <span>{currentLocationName}</span>
            </div>
          )}
          <button
              onClick={handleResetGame}
              disabled={isLoading}
              title="Reset Game State"
              className="p-1.5 sm:p-2 rounded-md hover:bg-slate-700 text-slate-300 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-xs sm:text-sm"
          >
              <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> Reset World
          </button>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={toggleWorldMap}
            title="Toggle World Map"
            className="p-2 rounded-md hover:bg-slate-700 text-slate-300 hover:text-purple-400 transition-colors"
            aria-label="Toggle world map"
          >
            <MapIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => toggleRightPanel('equipment')}
            title="Toggle Equipment Panel"
            className={`p-2 rounded-md transition-colors ${activeRightPanel === 'equipment' && isRightSidePanelVisible ? 'bg-slate-600 text-teal-400' : 'hover:bg-slate-700 text-slate-300 hover:text-teal-400'}`}
            aria-label="Toggle equipment panel"
          >
            <ShieldCheckIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => toggleRightPanel('journal')}
            title="Toggle Journal (Quests & Characters)"
            className={`p-2 rounded-md transition-colors ${activeRightPanel === 'journal' && isRightSidePanelVisible ? 'bg-slate-600 text-rose-400' : 'hover:bg-slate-700 text-slate-300 hover:text-rose-400'}`}
            aria-label="Toggle journal panel"
          >
            <BookOpenIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => toggleRightPanel('status')}
            title="Toggle Inventory/Status Panel"
            className={`p-2 rounded-md transition-colors ${activeRightPanel === 'status' && isRightSidePanelVisible ? 'bg-slate-600 text-sky-400' : 'hover:bg-slate-700 text-slate-300 hover:text-sky-400'}`}
            aria-label="Toggle game status panel"
          >
            <BagIcon className="w-6 h-6" />
          </button>
      </div>
    </header>
  );
};

export default AppHeader;
