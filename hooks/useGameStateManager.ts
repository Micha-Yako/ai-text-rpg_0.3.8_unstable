import { useState, useCallback, useEffect } from 'react';
import { Item, PlayerParameter, ChatMessage, AIResponseData, StatusEffect, Quest, CharacterNote } from '../types';
import { generateId } from '../game-state-processors/utils';
import { processInventoryChanges, getBonusCapacity } from '../game-state-processors/inventory';
import { processParameterChanges } from '../game-state-processors/parameters';
import { applyAICalibration } from '../game-state-processors/calibration';
import { getInitialGameState } from '../game-state-processors/initialState';
import { processStatusEffectChanges } from '../game-state-processors/statusEffects';
import { processQuestChanges, processCharacterNoteChanges } from '../game-state-processors/journal';

export const useGameStateManager = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [systemMessagesHistory, setSystemMessagesHistory] = useState<ChatMessage[]>([]);
  
  const [inventory, setInventory] = useState<Item[]>([]);
  const [baseInventoryCapacity, setBaseInventoryCapacity] = useState<number>(10);
  const [inventoryCapacity, setInventoryCapacity] = useState<number>(10);
  
  const [playerParameters, setPlayerParameters] = useState<PlayerParameter[]>([]);
  const [customGameRules, setCustomGameRules] = useState<string>("");
  const [statusEffects, setStatusEffects] = useState<StatusEffect[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [characterNotes, setCharacterNotes] = useState<CharacterNote[]>([]);

  // Location name is now just a label for the current area.
  const [currentLocationName, setCurrentLocationName] = useState<string>("The Void");

  useEffect(() => {
    const bonus = getBonusCapacity(inventory);
    setInventoryCapacity(baseInventoryCapacity + bonus);
  }, [inventory, baseInventoryCapacity]);

  const addGameMessageToChat = useCallback((sender: ChatMessage['sender'], text: string): void => {
    setChatHistory(prev => [...prev, { id: generateId('msg'), sender, text, timestamp: new Date() }]);
  }, []);

  const addSystemMessageToLog = useCallback((text: string): void => {
    setSystemMessagesHistory(prev => [...prev, { id: generateId('sysmsg'), sender: 'system', text, timestamp: new Date() }]);
  }, []);

  const processAIStateChanges = useCallback((aiData: AIResponseData) => {
    if (aiData.inventoryChanges) {
      setInventory(currentInv => {
            return processInventoryChanges(currentInv, aiData.inventoryChanges!, baseInventoryCapacity, addSystemMessageToLog, addGameMessageToChat);
        });
    }
    if (aiData.parameterChanges) {
      setPlayerParameters(params => processParameterChanges(params, aiData.parameterChanges!));
    }
    if (aiData.statusEffectChanges) {
      setStatusEffects(effects => processStatusEffectChanges(effects, aiData.statusEffectChanges!));
    }
    if (aiData.questChanges) {
        setQuests(q => processQuestChanges(q, aiData.questChanges!));
    }
    if (aiData.characterNoteChanges) {
        setCharacterNotes(cn => processCharacterNoteChanges(cn, aiData.characterNoteChanges!));
    }
    if (aiData.inventoryCapacityChange?.newCapacity !== undefined) {
      setBaseInventoryCapacity(aiData.inventoryCapacityChange.newCapacity);
      addSystemMessageToLog(`Base inventory capacity set to: ${aiData.inventoryCapacityChange.newCapacity}.`);
    }
    if (aiData.currentLocationName) {
        setCurrentLocationName(aiData.currentLocationName);
    }
  }, [baseInventoryCapacity, addSystemMessageToLog, addGameMessageToChat]);

  const applyActiveStatusEffects = useCallback(() => {
    if (statusEffects.length === 0) return;

    let paramUpdates = [...playerParameters];
    const remainingEffects: StatusEffect[] = [];
    let messages: string[] = [];

    statusEffects.forEach(effect => {
      let effectShouldBeKept = true;
      const paramIndex = paramUpdates.findIndex(p => p.name.toLowerCase() === effect.targetParameterName.toLowerCase());

      if (paramIndex > -1) {
        const originalValue = Number(paramUpdates[paramIndex].value);
        if (!isNaN(originalValue)) {
          if (effect.modifier !== 0) {
            const newValue = originalValue + effect.modifier;
            paramUpdates[paramIndex] = { ...paramUpdates[paramIndex], value: newValue };
            messages.push(`Status '${effect.name}' applied: ${effect.targetParameterName} changed by ${effect.modifier} (now ${newValue}).`);
          }
        } else {
          if (effect.modifier !== 0) {
            messages.push(`System Warning: Effect '${effect.name}' could not be applied to non-numeric parameter '${effect.targetParameterName}' with value '${paramUpdates[paramIndex].value}'.`);
          }
        }
      } else if (effect.modifier !== 0) {
          messages.push(`System Warning: Effect '${effect.name}' targets non-existent parameter '${effect.targetParameterName}'.`);
      }

      let newDuration = effect.duration;
      if (effect.duration > 0) {
        newDuration -= 1;
        if (newDuration <= 0) {
          effectShouldBeKept = false;
          messages.push(`Status '${effect.name}' has worn off.`);
        }
      }
      
      if (effectShouldBeKept) {
        remainingEffects.push({ ...effect, duration: newDuration });
      }
    });

    setPlayerParameters(paramUpdates);
    setStatusEffects(remainingEffects);

    if (messages.length > 0) {
      addSystemMessageToLog(messages.join(' '));
    }
  }, [statusEffects, playerParameters, addSystemMessageToLog]);
  
  const resetCoreGameState = useCallback(() => {
    const state = getInitialGameState();
    setInventory(state.inventory);
    setPlayerParameters(state.playerParameters);
    setBaseInventoryCapacity(state.inventoryCapacity);
    setCustomGameRules(state.customGameRules);
    setStatusEffects(state.statusEffects);
    setQuests(state.quests);
    setCharacterNotes(state.characterNotes);
    setChatHistory([]);
    setSystemMessagesHistory([]); 
    setCurrentLocationName("The Void");
  }, []);

  const resetAllGameState = useCallback(() => {
    resetCoreGameState();
    addSystemMessageToLog("Full game state reset.");
  }, [resetCoreGameState, addSystemMessageToLog]);
  
  useEffect(() => {
    resetAllGameState();
  }, [resetAllGameState]);


  return {
    chatHistory,
    systemMessagesHistory,
    inventory,
    inventoryCapacity,
    playerParameters,
    statusEffects,
    quests,
    characterNotes,
    customGameRules,
    setCustomGameRules, 
    addGameMessageToChat,
    addSystemMessageToLog,
    processAIStateChanges,
    applyActiveStatusEffects,
    applyCalibration: applyAICalibration,
    resetCoreGameState,
    resetAllGameState,
    currentLocationName,
    setCurrentLocationName,
    setInventory,
    setPlayerParameters,
    setBaseInventoryCapacity,
  };
};