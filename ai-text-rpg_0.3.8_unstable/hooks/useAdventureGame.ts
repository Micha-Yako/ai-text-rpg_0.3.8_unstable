

import { useState, useEffect, useCallback } from 'react';
import { useGameSessionManager } from './useGameSessionManager';
import { useGameStateManager } from './useGameStateManager';
import { useSpriteSystemAI } from './useSpriteSystemAI';
import { useGameController } from './useGameController';
import { useWorldMapManager } from './useWorldMapManager';
import { ChatMessage, SpriteDefinition, StatusEffect, PlacedSprite, Quest, CharacterNote, WorldMapZone, WorldMapNPCMarker, WorldMapWeatherZone } from '../types';
import { GAME_GRID_WIDTH, GAME_GRID_HEIGHT } from '../constants';

export interface Camera {
  x: number;
  y: number;
}
export interface UseAdventureGameReturn {
  chatHistory: ChatMessage[];
  systemMessagesHistory: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  systemPrompt: string;
  setSystemPrompt: React.Dispatch<React.SetStateAction<string>>;
  customGameRules: string;
  setCustomGameRules: React.Dispatch<React.SetStateAction<string>>;
  inventory: import('../types').Item[];
  inventoryCapacity: number;
  playerParameters: import('../types').PlayerParameter[];
  statusEffects: StatusEffect[];
  quests: Quest[];
  characterNotes: CharacterNote[];
  handleSendMessage: (userInput: string, isContinuation?: boolean) => Promise<void>;
  handleResetGame: () => void;
  handleRestartChatWithNewSystemPrompt: () => void;
  handleContinueStory: () => void;
  spriteDefinitions: SpriteDefinition[];
  placedSprites: PlacedSprite[];
  currentLocationName: string;
  timeOfDay: 'sun' | 'night' | 'normal';
  camera: Camera;
  worldMapZones: WorldMapZone[];
  worldMapNpcMarkers: WorldMapNPCMarker[];
  worldMapWeatherZones: WorldMapWeatherZone[];
  playerPosition: { x: number; y: number };
}

export const useAdventureGame = (): UseAdventureGameReturn => {
  
  // State Management Hooks
  const gameStateManager = useGameStateManager();
  const gameSessionManager = useGameSessionManager();
  const spriteSystemAI = useSpriteSystemAI(gameStateManager.addSystemMessageToLog);
  const worldMapManager = useWorldMapManager();
  
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
  const [timeOfDay, setTimeOfDay] = useState<'sun' | 'night' | 'normal'>('normal');

  const gameController = useGameController({
    gameStateManager,
    gameSessionManager,
    spriteSystemAI,
    worldMapManager,
    camera,
    setCamera,
    timeOfDay,
    setTimeOfDay
  });

  const { isProcessingTurn, playerPosition } = gameController;

  const handleResetGame = useCallback(async () => {
    setTimeOfDay('normal');
    gameController.setPlayerPosition({ x: Math.round(GAME_GRID_WIDTH / 2), y: Math.round(GAME_GRID_HEIGHT / 2) });
    setCamera({ x: 0, y: 0 });
    gameStateManager.resetAllGameState();
    spriteSystemAI.clearSpriteSystemData();
    worldMapManager.resetWorldMap();
    gameStateManager.addSystemMessageToLog("Game has been reset. Describe your new world to begin.");
  }, [gameStateManager, spriteSystemAI, worldMapManager, gameController]);

  const handleFullRestart = useCallback(async (message: string) => {
    setTimeOfDay('normal');
    gameController.setPlayerPosition({ x: Math.round(GAME_GRID_WIDTH / 2), y: Math.round(GAME_GRID_HEIGHT / 2) });
    setCamera({ x: 0, y: 0 });
    gameStateManager.resetAllGameState();
    spriteSystemAI.clearSpriteSystemData();
    worldMapManager.resetWorldMap();
    gameStateManager.addSystemMessageToLog(message);
  }, [spriteSystemAI, gameStateManager, worldMapManager, gameController]);
  
  // Initial setup on first load
  useEffect(() => {
    handleResetGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    chatHistory: gameStateManager.chatHistory,
    systemMessagesHistory: gameStateManager.systemMessagesHistory,
    isLoading: isProcessingTurn || gameSessionManager.isLoading,
    error: gameController.error || gameSessionManager.error,
    systemPrompt: gameSessionManager.systemPrompt,
    setSystemPrompt: gameSessionManager.setSystemPrompt,
    customGameRules: gameStateManager.customGameRules,
    setCustomGameRules: gameStateManager.setCustomGameRules,
    inventory: gameStateManager.inventory,
    inventoryCapacity: gameStateManager.inventoryCapacity,
    playerParameters: gameStateManager.playerParameters,
    statusEffects: gameStateManager.statusEffects,
    quests: gameStateManager.quests,
    characterNotes: gameStateManager.characterNotes,
    handleSendMessage: gameController.handleSendMessage,
    handleResetGame,
    handleRestartChatWithNewSystemPrompt: () => {
        handleFullRestart("Game restarting with new System Prompt...");
    },
    handleContinueStory: gameController.handleContinueStory,
    spriteDefinitions: spriteSystemAI.spriteDefinitions,
    placedSprites: spriteSystemAI.placedSprites,
    currentLocationName: gameStateManager.currentLocationName,
    timeOfDay,
    camera,
    worldMapZones: worldMapManager.zones,
    worldMapNpcMarkers: worldMapManager.npcMarkers,
    worldMapWeatherZones: worldMapManager.weatherZones,
    playerPosition,
  };
};