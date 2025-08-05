





export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
}

export interface ItemEffect {
  type: 'capacity_modifier';
  value: number; // e.g., 10 for a backpack
}

export interface Item {
  id:string;
  name: string;
  description: string;
  quantity: number;
  size: number; // How many inventory slots it takes. Defaults to 1.
  isEquipped?: boolean;
  effects?: ItemEffect[];
}

export interface PlayerParameter {
  id: string;
  name: string;
  value: string | number;
}

export interface StatusEffect {
  id: string;
  name: string;
  description: string;
  targetParameterName: string; // e.g., 'Health'
  modifier: number; // e.g., -5 for damage, +2 for regen
  duration: number; // in turns, -1 for permanent
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
  reward: string;
}

export interface CharacterNote {
  id: string;
  name: string;
  description: string;
}


export type AIStateChangeAction = 'add' | 'remove' | 'update';

export interface InventoryChange {
  action: AIStateChangeAction;
  item?: Omit<Item, 'id'>; 
  itemName?: string; 
  changes?: Partial<Omit<Item, 'id'>>; 
  quantity?: number; 
}

export interface ParameterChange {
  action: AIStateChangeAction;
  parameter?: Omit<PlayerParameter, 'id'>; 
  parameterName?: string; 
  newValue?: string | number; 
  changes?: Partial<Omit<PlayerParameter, 'id'>>;
}

export interface StatusEffectChange {
  action: AIStateChangeAction;
  effect?: Omit<StatusEffect, 'id'>;
  effectName?: string;
  changes?: Partial<Omit<StatusEffect, 'id'>>;
}

export interface QuestChange {
    action: AIStateChangeAction;
    quest?: Omit<Quest, 'id'>; // For 'add'
    questTitle?: string; // For 'update' or 'remove'
    changes?: Partial<Omit<Quest, 'id'>>; // For 'update'
}

export interface CharacterNoteChange {
    action: AIStateChangeAction;
    characterNote?: Omit<CharacterNote, 'id'>; // For 'add'
    characterName?: string; // For 'update' or 'remove'
    changes?: Partial<Omit<CharacterNote, 'id'>>; // For 'update'
}

export interface InventoryCapacityChange {
  newCapacity: number;
}

// --- World Map System ---
export type WorldMapZoneType = 'city' | 'town' | 'village' | 'forest' | 'field' | 'river' | 'dungeon' | 'road' | 'other';

export interface WorldMapZone {
  id: string;
  name: string;
  type: WorldMapZoneType;
  area: { x: number; y: number; width: number; height: number; };
  color: string; // e.g., '#FF5733'
}

export interface WorldMapNPCMarker {
  id: string; // Unique ID for the marker
  spriteInstanceId: string; // Links to the specific NPC on the detailed map
  name: string;
  x: number;
  y: number;
  markerType?: 'npc' | 'merchant';
}

export interface WorldMapZoneChange {
  action: AIStateChangeAction;
  zone?: Omit<WorldMapZone, 'id'>;
  zoneName?: string;
  changes?: Partial<Omit<WorldMapZone, 'id'>>;
}

export interface WorldMapNPCMarkerChange {
  action: AIStateChangeAction;
  // For 'add' from AI, name is required, but other fields are optional until linked.
  marker?: Partial<Omit<WorldMapNPCMarker, 'id'>> & { name: string };
  markerId?: string; // For updates/deletes
  markerName?: string; // For finding markers by name
  changes?: Partial<Omit<WorldMapNPCMarker, 'id'>>;
}

// New Weather Zone Types
export interface WorldMapWeatherZone {
    id: string;
    temperature: number; // in Celsius
    area: { x: number; y: number; width: number; height: number };
    color: string; // Visual representation color
}

export interface WorldMapWeatherZoneChange {
    action: AIStateChangeAction;
    zone?: Omit<WorldMapWeatherZone, 'id'>;
    zoneId?: string; // For update/remove
    changes?: Partial<Omit<WorldMapWeatherZone, 'id'>>;
}


export interface AIResponseData {
  narrative: string;
  inventoryChanges?: InventoryChange[];
  parameterChanges?: ParameterChange[];
  statusEffectChanges?: StatusEffectChange[];
  questChanges?: QuestChange[]; // New
  characterNoteChanges?: CharacterNoteChange[]; // New
  inventoryCapacityChange?: InventoryCapacityChange;
  // New fields for location management
  currentLocationName?: string; 
  isNewLocation?: boolean; // True if this is a new, distinct location
  requestedPlayerPosition?: { x: number; y: number }; // AI suggests where player should be
  locationEffects?: { timeOfDay?: "sun" | "night" | "normal" };
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: GroundingChunkWeb;
}

// --- Sprite System & Modules ---
export interface LightModule {
  color: string;
  intensity: number;
  range: number;
  pulse?: boolean;
}

export interface CollisionModule {
  isSolid: boolean;
}

export interface SpriteModules {
  light?: LightModule;
  collision?: CollisionModule;
  shadow?: { isPermanent: boolean };
}

export type ShapeType = 'cube' | 'rhombus' | 'triangle' | 'circle' | 'trapezoid'; // Added trapezoid
export type NoiseType = 'simple_fractal' | 'cellular' | 'pixel_dither' | 'none'; // Added pixel_dither and none

export interface SpriteShapeParams {
  type: ShapeType;
  sizeRatios: { w: number, h: number }; // Relative to SPRITE_CELL_SIZE for each dimension
  color: string; // Hex color
  offsetXRatio: number; // Relative to SPRITE_CELL_SIZE
  offsetYRatio: number; // Relative to SPRITE_CELL_SIZE
  rotation?: number; // In degrees (0-360)
  opacity?: number; // 0 (transparent) to 1 (opaque)
  noise?: {
    type: NoiseType;
    scale: number; // e.g., 0.1 for large features, 1.0 for small/fine features
    strength: number; // 0 to 1, opacity/intensity of noise overlay
  };
  texture?: string; // e.g., "wood_grain", "rough_stone", "metallic_sheen", "cobblestone", "water_ripples", "leafy_texture", "glowing_aura"
  zIndex?: number; // For layering shapes within a sprite
  topWidthRatio?: number; // For trapezoids, ratio of top width to base width (sizeRatios.w)
}

export interface SpriteDefinition {
  id: string; // Unique ID for this definition
  name: string; // Name from AI, should be unique for lookup
  descriptionFromAI: string; // AI's textual description of what it represents
  shapes: SpriteShapeParams[]; // Visual composition
  baseColor: string; // Fallback or primary color
  isPlayerCandidate?: boolean; // AI's suggestion if this could be a player sprite
  modules?: SpriteModules;
}

export interface PlacedSprite {
  spriteDefinitionId: string; // Links to SpriteDefinition.id
  instanceId: string; // Unique ID for this specific instance on the map
  x: number; // Grid X coordinate
  y: number; // Grid Y coordinate
  name: string; // Copied from SpriteDefinition.name for easier debugging/access
  layer?: number; // Drawing layer. 0: Floor, 1: Objects, 2: Characters etc.
}

// Location Management
export interface LocationState {
  name: string;
  narrativeSeed?: string; // Initial narrative or context that defined this location
  placedSprites: PlacedSprite[]; // Sprites placed in this location
  lastPlayerCoordinates?: { x: number; y: number }; // Player's last position in this location
}


// AI Response types for Sprite System AIs

export interface AISpriteShapeSuggestion {
    type: ShapeType;
    size?: { w?: number; h?: number }; // Suggestion for width and height in % of cell size
    color: string;
    offset?: { x?: number; y?: number }; // Optional offset, each axis also optional
    rotation?: number; // In degrees
    opacity?: number; // 0 to 1
    noise?: { type: NoiseType; scale?: number; strength?: number };
    texture?: string; 
    zIndex?: number; // Optional z-index for layering within the sprite
    topWidthRatio?: number;
}
export interface AISpriteDefinitionSuggestion {
    name: string;
    description: string;
    baseColor: string;
    isPlayerCandidate?: boolean;
    shapes: AISpriteShapeSuggestion[];
    modules?: SpriteModules;
}
export interface SpriteDefinitionAIResponse {
  newSprites: AISpriteDefinitionSuggestion[];
}

export interface AISpritePlacementSuggestion {
    spriteName: string; 
    x?: number; // Optional if area is used. Represents top-left of single sprite or area.
    y?: number; // Optional if area is used. Represents top-left of single sprite or area.
    count?: number; // How many instances to place (e.g., for stack of coins, group of trees) - for single x,y
    area?: { // New field for rectangular fills
        x: number;
        y: number;
        width: number;
        height: number;
    };
    layer?: number; // Suggested drawing layer.
}
export interface SpritePlacementAIResponse {
  placements: AISpritePlacementSuggestion[];
  sceneShouldBeReplaced?: boolean; // AI signals if the whole scene should be redrawn
}

export interface AISpriteMovementSuggestion {
    spriteName?: string; 
    spriteInstanceId?: string; 
    targetX: number;
    targetY: number;
    isPlayerMovement?: boolean; 
}
export interface SpriteMovementAIResponse {
  movements: AISpriteMovementSuggestion[];
}

// Context Assessor AI Output
export interface ContextAssessorAIResponse {
  sceneChangeSignificance: "major" | "minor" | "none"; // How significant is the scene change implied?
  playerActionSummary: string; // Brief summary of what player is doing
  keyElementsForDefinition: string[]; // Keywords/phrases for SpriteDefinerAI
  keyElementsForPlacement: string[]; // Keywords/phrases for SpritePlacerAI
  keyElementsForMovement: string[]; // Keywords/phrases for SpriteMovementAI
  explicitPlayerCoordinates?: { x: number; y: number }; // Optional: if AI deduces explicit target coords for player
  // New fields for location context
  detectedLocationName?: string; // If AI identifies a known or new location by name from narrative/user input
  isLocationChange?: "new" | "return" | "none"; // More explicit signal about location transition
  entryPoint?: { x: number; y: number }; // Suggested player coords for new locations, relative to that location's map
}

// New type for deletion suggestion
export interface AISpriteDeletionSuggestion {
    spriteName?: string; // Delete the definition and all instances
    spriteInstanceId?: string; // Delete a specific instance from the map
}

// New type for the unified Manual Mode response
export interface ManualAIResponse {
  // From GameMasterAI
  narrative: string;
  inventoryChanges?: InventoryChange[];
  parameterChanges?: ParameterChange[];
  statusEffectChanges?: StatusEffectChange[];
  questChanges?: QuestChange[];
  characterNoteChanges?: CharacterNoteChange[];
  inventoryCapacityChange?: InventoryCapacityChange;
  currentLocationName?: string;
  isNewLocation?: boolean;
  requestedPlayerPosition?: { x: number; y: number };
  locationEffects?: { timeOfDay?: "sun" | "night" | "normal" };

  // Sprite System Actions
  newSpriteDefinitions?: AISpriteDefinitionSuggestion[];
  spriteModifications?: AISpriteDefinitionSuggestion[]; // For updating existing definitions
  spriteDeletions?: AISpriteDeletionSuggestion[]; // For deleting definitions or instances
  spritePlacements?: AISpritePlacementSuggestion[];
  sceneShouldBeReplaced?: boolean;
  spriteMovements?: AISpriteMovementSuggestion[];

  // World Map Actions
  worldMapZoneChanges?: WorldMapZoneChange[];
  worldMapNPCMarkerChanges?: WorldMapNPCMarkerChange[];
  worldMapWeatherZoneChanges?: WorldMapWeatherZoneChange[];
}