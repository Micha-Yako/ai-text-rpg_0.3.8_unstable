
import { useState, useCallback } from 'react';
import { SpriteDefinition, PlacedSprite } from '../types';

type AddSystemMessageFunc = (text: string) => void;

export const useSpriteSystemAI = (addSystemMessageToLog: AddSystemMessageFunc) => {
  const [spriteDefinitions, setSpriteDefinitions] = useState<SpriteDefinition[]>([]);
  const [placedSprites, setPlacedSprites] = useState<PlacedSprite[]>([]);

  const clearSpriteSystemData = useCallback(() => {
    setSpriteDefinitions([]);
    setPlacedSprites([]);
    addSystemMessageToLog("Sprite system visual data (definitions & placements) cleared.");
  }, [addSystemMessageToLog]);

  return {
    spriteDefinitions,
    setSpriteDefinitions,
    placedSprites,
    setPlacedSprites,
    clearSpriteSystemData,
  };
};
