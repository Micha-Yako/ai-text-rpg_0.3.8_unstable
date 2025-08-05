
import { Item, PlayerParameter } from '../types';

export const GAME_GRID_WIDTH = 14; // Changed from 16 to 14
export const GAME_GRID_HEIGHT = 12;
export const SPRITE_CELL_SIZE = 36; // pixels, increased from 28 for larger sprites

export const GEMINI_MODEL_NAME = 'gemini-2.5-flash';
export const HELPER_AI_MODEL_NAME = 'gemini-2.5-flash'; // For all helper AIs including ContextAssessor

export const INITIAL_CUSTOM_GAME_RULES = "The world is a blank canvas. Describe the starting scene, your character, and what they have to begin the adventure. Be descriptive to help the AI visualize the world.";

export const INITIAL_INVENTORY_CAPACITY = 3;
export const INITIAL_INVENTORY: Item[] = [];
export const INITIAL_PLAYER_PARAMETERS: PlayerParameter[] = [];

export const CONTINUE_STORY_PROMPT = "Continue the story based on the current situation. Describe what happens next or what the player observes.";

// Keywords for GameView sprite rendering logic
export const COMMON_ENVIRONMENTAL_TERMS = ["Tile", "Block", "Wall", "Floor", "Path", "Segment", "Plank", "Road", "Water", "Grass", "Dirt", "Stone", "Wood", "Ground", "Paving", "Counter", "Carpet", "Railing", "Pillar", "Column"];
export const CHARACTER_KEYWORDS = ["Patron", "Guard", "Merchant", "Goblin", "Hero", "Player", "Character", "NPC", "Creature", "Figure", "Person", "Being", "Enemy", "Ally", "Human", "Elf", "Dwarf", "Orc", "Innkeeper", "Landlady", "Bartender", "Shopkeeper", "Villager", "Bandit", "Wizard", "Knight"];
