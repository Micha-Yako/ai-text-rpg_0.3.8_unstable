import { Item, PlayerParameter, StatusEffect, Quest, CharacterNote } from '../types';
import { generateId } from './utils';
import { 
    INITIAL_INVENTORY, 
    INITIAL_PLAYER_PARAMETERS, 
    INITIAL_INVENTORY_CAPACITY,
    INITIAL_CUSTOM_GAME_RULES 
} from '../../constants/gameConfig';

export const getInitialGameState = (): {
  inventory: Item[];
  playerParameters: PlayerParameter[];
  inventoryCapacity: number;
  customGameRules: string;
  statusEffects: StatusEffect[];
  quests: Quest[];
  characterNotes: CharacterNote[];
} => {
  const initialInventoryWithIds = INITIAL_INVENTORY.map(item => ({
      ...item, 
      id: generateId('item'),
      size: item.size || 1
    }));
  const initialPlayerParametersWithIds = INITIAL_PLAYER_PARAMETERS.map(param => ({...param, id: generateId('param')}));
  
  return {
    inventory: initialInventoryWithIds,
    playerParameters: initialPlayerParametersWithIds,
    inventoryCapacity: INITIAL_INVENTORY_CAPACITY,
    customGameRules: INITIAL_CUSTOM_GAME_RULES,
    statusEffects: [],
    quests: [],
    characterNotes: [],
  };
};
