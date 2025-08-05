

import React, { useState } from 'react';
import { useAdventureGame } from './hooks/useAdventureGame';
import SettingsPanel from './components/SettingsPanel';
import InventoryPanel from './components/InventoryPanel';
import ParametersPanel from './components/ParametersPanel';
import StatusEffectsPanel from './components/StatusEffectsPanel';
import JournalPanel from './components/JournalPanel';
import ChatDisplay from './components/ChatDisplay';
import ChatInput from './components/ChatInput';
import { GameView } from './components/GameView';
import { ForwardIcon, ChatBubbleLeftRightIcon, ClipboardDocumentListIcon, CogIcon } from './components/Icons';
import EquipmentPanel from './components/EquipmentPanel';
import AppHeader from './components/AppHeader';
import WorldMapModal from './components/WorldMapModal';

type ActiveMainTab = 'story' | 'systemLog' | 'settings';
type ActiveRightPanel = 'status' | 'journal' | 'equipment';

const App: React.FC = () => {
  const {
    chatHistory,
    systemMessagesHistory,
    isLoading,
    error,
    systemPrompt,
    setSystemPrompt,
    customGameRules,
    setCustomGameRules,
    inventory,
    inventoryCapacity,
    playerParameters,
    statusEffects,
    quests,
    characterNotes,
    handleSendMessage,
    handleResetGame,
    handleRestartChatWithNewSystemPrompt,
    handleContinueStory,
    spriteDefinitions,
    placedSprites,
    currentLocationName,
    timeOfDay,
    camera,
    worldMapZones,
    worldMapNpcMarkers,
    worldMapWeatherZones,
    playerPosition,
  } = useAdventureGame();

  const [isRightSidePanelVisible, setIsRightSidePanelVisible] = useState<boolean>(true);
  const [activeRightPanel, setActiveRightPanel] = useState<ActiveRightPanel>('status');
  const [activeMainTab, setActiveMainTab] = useState<ActiveMainTab>('story');
  const [isWorldMapOpen, setIsWorldMapOpen] = useState<boolean>(false);


  const toggleRightPanel = (panel: ActiveRightPanel) => {
    if (isRightSidePanelVisible && activeRightPanel === panel) {
      setIsRightSidePanelVisible(false);
    } else {
      setActiveRightPanel(panel);
      setIsRightSidePanelVisible(true);
    }
  };

  return (
    <>
      <WorldMapModal 
        isOpen={isWorldMapOpen}
        onClose={() => setIsWorldMapOpen(false)}
        zones={worldMapZones}
        weatherZones={worldMapWeatherZones}
        markers={worldMapNpcMarkers}
        playerPosition={playerPosition}
      />
      <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
        <AppHeader
          currentLocationName={currentLocationName}
          isLoading={isLoading}
          handleResetGame={handleResetGame}
          activeRightPanel={activeRightPanel}
          isRightSidePanelVisible={isRightSidePanelVisible}
          toggleRightPanel={toggleRightPanel}
          toggleWorldMap={() => setIsWorldMapOpen(prev => !prev)}
        />
        
        <div className="flex flex-1 overflow-hidden p-1 sm:p-2 md:p-4 gap-1 sm:gap-2 md:gap-4">
          {/* Left Panel: Game View */}
          <div className="w-full md:w-2/5 lg:w-1/3 h-full overflow-hidden bg-slate-900 rounded-lg"> 
            <GameView
              spriteDefinitions={spriteDefinitions}
              placedSprites={placedSprites}
              camera={camera}
              isLoading={isLoading && chatHistory.length > 0} 
              currentLocationName={currentLocationName}
              timeOfDay={timeOfDay}
            />
          </div>

          {/* Center Panel: Chat/Logs/Settings Tabs */}
          <div className="w-full md:w-3/5 lg:w-1/2 h-full flex flex-col bg-slate-800 rounded-lg shadow-xl"> 
            <div className="flex border-b border-slate-700 flex-shrink-0">
              <button
                onClick={() => setActiveMainTab('story')}
                className={`flex-1 py-2 px-3 text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2 transition-colors
                            ${activeMainTab === 'story' ? 'bg-slate-700 text-sky-400' : 'text-slate-400 hover:bg-slate-700/50 hover:text-sky-300'}`}
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4 sm:w-5 sm:h-5" /> Story
              </button>
              <button
                onClick={() => setActiveMainTab('systemLog')}
                className={`flex-1 py-2 px-3 text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2 transition-colors
                            ${activeMainTab === 'systemLog' ? 'bg-slate-700 text-sky-400' : 'text-slate-400 hover:bg-slate-700/50 hover:text-sky-300'}`}
              >
                <ClipboardDocumentListIcon className="w-4 h-4 sm:w-5 sm:h-5" /> System Log
              </button>
              <button
                onClick={() => setActiveMainTab('settings')}
                className={`flex-1 py-2 px-3 text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2 transition-colors
                            ${activeMainTab === 'settings' ? 'bg-slate-700 text-sky-400' : 'text-slate-400 hover:bg-slate-700/50 hover:text-sky-300'}`}
              >
                <CogIcon className="w-4 h-4 sm:w-5 sm:h-5" /> Settings
              </button>
            </div>

            {activeMainTab === 'story' && (
              <ChatDisplay messages={chatHistory} isLoading={isLoading} chatType="story" />
            )}
            {activeMainTab === 'systemLog' && (
              <ChatDisplay messages={systemMessagesHistory} isLoading={false} chatType="system" />
            )}
            {activeMainTab === 'settings' && (
              <div className="flex-grow overflow-y-auto"> 
                <SettingsPanel
                  systemPrompt={systemPrompt}
                  setSystemPrompt={setSystemPrompt}
                  customGameRules={customGameRules}
                  setCustomGameRules={setCustomGameRules}
                  onRestartChatWithNewSystemPrompt={handleRestartChatWithNewSystemPrompt}
                />
              </div>
            )}
            
            {error && <div className="p-2 text-sm bg-red-700 text-white text-center flex-shrink-0">{error}</div>}
            
            <>
              {activeMainTab === 'story' && (
                <ChatInput 
                  onSendMessage={handleSendMessage} 
                  isLoading={isLoading} 
                  placeholder={"Describe your world or what you do next..."}
                />
              )}
              {activeMainTab === 'story' && (
                <div className="p-2 sm:p-3 bg-slate-800 border-t border-slate-700 rounded-b-lg flex-shrink-0 flex gap-2 sm:gap-3 justify-center">
                  <button
                    onClick={handleContinueStory}
                    disabled={isLoading}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md text-sm transition-colors disabled:opacity-50 flex items-center"
                    title="Ask AI to continue the story"
                  >
                    <ForwardIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> Continue Story
                  </button>
                </div>
              )}
            </>
          </div>

          {/* Right Panel: Inventory, Parameters, Status Effects OR Journal */}
          {isRightSidePanelVisible && (
              <div className="w-full md:w-full lg:w-1/6 h-full flex flex-col gap-2 md:gap-4 overflow-y-auto"> 
                {activeRightPanel === 'status' && (
                  <>
                    <div className="flex-1 min-h-[150px] sm:min-h-[200px] md:min-h-0 md:flex-[0_0_33.33%]">
                        <InventoryPanel items={inventory} capacity={inventoryCapacity} />
                    </div>
                    <div className="flex-1 min-h-[150px] sm:min-h-[200px] md:min-h-0 md:flex-[0_0_33.33%]">
                        <ParametersPanel parameters={playerParameters} />
                    </div>
                    <div className="flex-1 min-h-[150px] sm:min-h-[200px] md:min-h-0 md:flex-[0_0_33.33%]">
                        <StatusEffectsPanel effects={statusEffects} />
                    </div>
                  </>
                )}
                {activeRightPanel === 'journal' && (
                  <div className="flex-1 min-h-0">
                    <JournalPanel quests={quests} characterNotes={characterNotes} />
                  </div>
                )}
                {activeRightPanel === 'equipment' && (
                  <div className="flex-1 min-h-0">
                    <EquipmentPanel items={inventory} />
                  </div>
                )}
              </div>
          )}
        </div>
      </div>
    </>
  );
};

export default App;