







import { useState, useCallback, useEffect } from 'react';
import { useGameStateManager } from './useGameStateManager';
import { useGameSessionManager } from './useGameSessionManager';
import { useSpriteSystemAI } from './useSpriteSystemAI';
import { useWorldMapManager } from './useWorldMapManager';
import { parseAIJsonResponse, compressPlacedSpritesForPrompt, compressWorldMapZonesForPrompt, compressWorldMapNPCsForPrompt, compressWorldMapWeatherZonesForPrompt } from '../game-state-processors/aiUtils';
import { ManualAIResponse, SpriteShapeParams, SpriteDefinition, PlacedSprite, WorldMapNPCMarkerChange, WorldMapNPCMarker } from '../types'; 
import { MANUAL_MODE_UBER_PROMPT, GAME_GRID_WIDTH, GAME_GRID_HEIGHT, CONTINUE_STORY_PROMPT } from '../constants';
import { generateId } from '../game-state-processors/utils';
import { Camera } from './useAdventureGame';

interface GameControllerProps {
  gameStateManager: ReturnType<typeof useGameStateManager>;
  gameSessionManager: ReturnType<typeof useGameSessionManager>;
  spriteSystemAI: ReturnType<typeof useSpriteSystemAI>;
  worldMapManager: ReturnType<typeof useWorldMapManager>;
  camera: Camera;
  setCamera: React.Dispatch<React.SetStateAction<Camera>>;
  timeOfDay: 'sun' | 'night' | 'normal';
  setTimeOfDay: React.Dispatch<React.SetStateAction<'sun' | 'night' | 'normal'>>;
}

export const useGameController = ({
  gameStateManager,
  gameSessionManager,
  spriteSystemAI,
  worldMapManager,
  camera,
  setCamera,
  timeOfDay,
  setTimeOfDay,
}: GameControllerProps) => {
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerPosition, setPlayerPosition] = useState({ x: Math.round(GAME_GRID_WIDTH / 2), y: Math.round(GAME_GRID_HEIGHT / 2) });

  const { addGameMessageToChat, addSystemMessageToLog } = gameStateManager;
  
  const centerCameraOnPlayer = useCallback(() => {
      const targetX = Math.floor(playerPosition.x - GAME_GRID_WIDTH / 2);
      const targetY = Math.floor(playerPosition.y - GAME_GRID_HEIGHT / 2);
      setCamera({ x: targetX, y: targetY });
  }, [playerPosition, setCamera]);

  useEffect(() => {
    centerCameraOnPlayer();
  }, [playerPosition, centerCameraOnPlayer]);

  const handleSendMessage = useCallback(async (userInput: string, isContinuation = false) => {
    if (!isContinuation) {
        addGameMessageToChat('user', userInput);
    }
    
    setIsProcessingTurn(true);
    setError(null);
    
    gameStateManager.applyActiveStatusEffects();
    
    const stateForPrompt = { ...gameStateManager, ...spriteSystemAI, ...worldMapManager };
    
    const visionPadding = 8;
    const aiVisibleArea = {
        minX: camera.x - visionPadding,
        minY: camera.y - visionPadding,
        maxX: camera.x + GAME_GRID_WIDTH + visionPadding,
        maxY: camera.y + GAME_GRID_HEIGHT + visionPadding,
    };
    const visibleSprites = spriteSystemAI.placedSprites.filter(sprite =>
        sprite.x >= aiVisibleArea.minX &&
        sprite.x < aiVisibleArea.maxX &&
        sprite.y >= aiVisibleArea.minY &&
        sprite.y < aiVisibleArea.maxY
    );
    
    const promptContext = {
        inventoryString: stateForPrompt.inventory.map(i => `${i.name} (x${i.quantity})`).join(', ') || 'Empty',
        parametersString: stateForPrompt.playerParameters.map(p => `${p.name}: ${p.value}`).join(', ') || 'None',
        statusEffectsString: stateForPrompt.statusEffects.map(e => e.name).join(', ') || 'None',
        questsString: stateForPrompt.quests.map(q => q.title).join(', ') || 'None',
        characterNotesString: stateForPrompt.characterNotes.map(n => n.name).join(', ') || 'None',
        definedSpritesString: stateForPrompt.spriteDefinitions.map(d => d.name).join(', ') || 'None',
        placedSpritesString: compressPlacedSpritesForPrompt(visibleSprites, stateForPrompt.spriteDefinitions),
        worldMapZonesString: compressWorldMapZonesForPrompt(stateForPrompt.zones),
        worldMapWeatherZonesString: compressWorldMapWeatherZonesForPrompt(stateForPrompt.weatherZones),
        worldMapNPCMarkersString: compressWorldMapNPCsForPrompt(stateForPrompt.npcMarkers),
        userInput: userInput,
        customGameRules: gameStateManager.customGameRules,
        playerX: playerPosition.x,
        playerY: playerPosition.y,
        cameraX: camera.x,
        cameraY: camera.y,
        currentLocationNameLabel: gameStateManager.currentLocationName,
        inventoryCapacity: gameStateManager.inventoryCapacity,
        aiVisionMinX: aiVisibleArea.minX,
        aiVisionMinY: aiVisibleArea.minY,
        aiVisionMaxX: aiVisibleArea.maxX,
        aiVisionMaxY: aiVisibleArea.maxY,
    };

    let promptForAI = gameSessionManager.systemPrompt;
    Object.entries(promptContext).forEach(([key, value]) => {
        promptForAI = promptForAI.replace(new RegExp(`{${key}}`, 'g'), String(value));
    });

    try {
        const resultText = await gameSessionManager.sendChatMessageToAI(promptForAI);
        if (resultText) {
            const parsed = parseAIJsonResponse<ManualAIResponse>(resultText);
            if (parsed) {
                // --- Step 1: Process narrative and core state changes ---
                if (parsed.narrative) addGameMessageToChat('ai', parsed.narrative);
                gameStateManager.processAIStateChanges(parsed);
                if (parsed.locationEffects?.timeOfDay) setTimeOfDay(parsed.locationEffects.timeOfDay);

                // --- Step 2: Prepare visual and spatial updates ---
                let allDefinitions = [...spriteSystemAI.spriteDefinitions];
                let currentPlacements = parsed.sceneShouldBeReplaced ? [] : [...spriteSystemAI.placedSprites];
                let npcMarkerUpdatesFromMovement: WorldMapNPCMarkerChange[] = [];

                // Define new sprites
                if (parsed.newSpriteDefinitions) {
                    const newDefs: SpriteDefinition[] = parsed.newSpriteDefinitions.map((sugg): SpriteDefinition => {
                        const shapes: SpriteShapeParams[] = (sugg.shapes || []).map(s => ({
                            type: s.type, sizeRatios: { w: (s.size?.w ?? 70) / 100, h: (s.size?.h ?? 70) / 100 },
                            color: s.color, offsetXRatio: (s.offset?.x ?? 0) / 100, offsetYRatio: (s.offset?.y ?? 0) / 100,
                            rotation: s.rotation ?? 0, opacity: s.opacity ?? 1,
                            noise: s.noise ? { type: s.noise.type, scale: s.noise.scale ?? 0.1, strength: s.noise.strength ?? 0.5 } : undefined,
                            texture: s.texture, zIndex: s.zIndex,
                            topWidthRatio: s.topWidthRatio,
                        }));
                        return {
                            id: generateId('spriteDef'), name: sugg.name, descriptionFromAI: sugg.description,
                            baseColor: sugg.baseColor, isPlayerCandidate: sugg.isPlayerCandidate,
                            modules: sugg.modules, shapes: shapes,
                        };
                    });
                    allDefinitions = [...allDefinitions, ...newDefs];
                    addSystemMessageToLog(`[Manual Mode] Defined ${newDefs.length} new sprites.`);
                }
                
                // Place new sprites
                if (parsed.spritePlacements) {
                    let placedCount = 0;
                    parsed.spritePlacements.forEach(p => {
                        const def = allDefinitions.find(d => d.name === p.spriteName);
                        if (def) {
                            if (p.area) {
                                 for (let tileX = p.area.x; tileX < p.area.x + p.area.width; tileX++) {
                                     for (let tileY = p.area.y; tileY < p.area.y + p.area.height; tileY++) {
                                         currentPlacements.push({
                                             spriteDefinitionId: def.id, instanceId: generateId(`${def.name}-inst`),
                                             x: tileX, y: tileY, name: def.name, layer: p.layer ?? 0
                                         });
                                         placedCount++;
                                     }
                                 }
                            } else if (p.x !== undefined && p.y !== undefined) {
                                const count = p.count || 1;
                                for(let i=0; i < count; i++) {
                                    currentPlacements.push({ spriteDefinitionId: def.id, instanceId: generateId('inst'), x: p.x, y: p.y, name: def.name, layer: p.layer ?? 4});
                                    placedCount++;
                                }
                            }
                        }
                    });
                    addSystemMessageToLog(`[Manual Mode] Placed ${placedCount} sprites. Scene replaced: ${!!parsed.sceneShouldBeReplaced}`);
                }

                // Move existing sprites (NPCs) and generate automatic NPC marker updates
                if (parsed.spriteMovements) {
                    let movedCount = 0;
                    parsed.spriteMovements.forEach(movement => {
                        let targetInstanceId = movement.spriteInstanceId;

                        // If only a name is provided, find the instanceId from the world map markers.
                        if (!targetInstanceId && movement.spriteName) {
                            const marker = worldMapManager.npcMarkers.find(m => m.name === movement.spriteName);
                            if (marker) {
                                targetInstanceId = marker.spriteInstanceId;
                            } else {
                                addSystemMessageToLog(`[Controller Warning] Could not move NPC '${movement.spriteName}'. They are not registered on the World Map.`);
                            }
                        }

                        if (targetInstanceId) {
                            const spriteIndex = currentPlacements.findIndex(p => p.instanceId === targetInstanceId);
                            if (spriteIndex !== -1) {
                                // Update sprite position in the temporary placements array
                                currentPlacements[spriteIndex].x = movement.targetX;
                                currentPlacements[spriteIndex].y = movement.targetY;
                                movedCount++;

                                // If this sprite has a world map marker, generate an update for it automatically.
                                const markerToUpdate = worldMapManager.npcMarkers.find(m => m.spriteInstanceId === targetInstanceId);
                                if (markerToUpdate) {
                                    npcMarkerUpdatesFromMovement.push({
                                        action: 'update',
                                        markerId: markerToUpdate.id,
                                        changes: { x: movement.targetX, y: movement.targetY }
                                    });
                                }
                            }
                        }
                    });
                    if (movedCount > 0) addSystemMessageToLog(`[Manual Mode] Moved ${movedCount} sprites.`);
                }


                // Delete sprites
                 if(parsed.spriteDeletions) {
                    parsed.spriteDeletions.forEach(deletion => {
                        if(deletion.spriteInstanceId) {
                            currentPlacements = currentPlacements.filter(p => p.instanceId !== deletion.spriteInstanceId);
                        } else if (deletion.spriteName) {
                            const defToDelete = allDefinitions.find(d => d.name === deletion.spriteName);
                            if (defToDelete) {
                                allDefinitions = allDefinitions.filter(d => d.id !== defToDelete.id);
                                currentPlacements = currentPlacements.filter(p => p.spriteDefinitionId !== defToDelete.id);
                            }
                        }
                    });
                 }
                
                // Move player (must happen before setting final sprite state)
                if (parsed.requestedPlayerPosition) {
                    setPlayerPosition(parsed.requestedPlayerPosition);
                    const playerDef = allDefinitions.find(def => def.isPlayerCandidate || def.name.toLowerCase() === 'player');
                    if (playerDef) {
                        const playerInstanceIndex = currentPlacements.findIndex(p => p.spriteDefinitionId === playerDef.id);
                        if (playerInstanceIndex > -1) {
                            currentPlacements[playerInstanceIndex] = { ...currentPlacements[playerInstanceIndex], x: parsed.requestedPlayerPosition!.x, y: parsed.requestedPlayerPosition!.y };
                        } else {
                            // If player sprite doesn't exist, create it.
                            currentPlacements.push({
                                spriteDefinitionId: playerDef.id,
                                instanceId: generateId('player-inst'),
                                x: parsed.requestedPlayerPosition.x,
                                y: parsed.requestedPlayerPosition.y,
                                name: playerDef.name,
                                layer: 4,
                            });
                        }
                    }
                }

                // --- Step 3: Commit all visual changes ---
                spriteSystemAI.setSpriteDefinitions(allDefinitions);
                spriteSystemAI.setPlacedSprites(currentPlacements);

                // --- Step 4: Process World Map changes with linked data ---
                const npcAddsFromAI = parsed.worldMapNPCMarkerChanges?.filter(c => c.action === 'add') || [];
                const npcRemovalsFromAI = parsed.worldMapNPCMarkerChanges?.filter(c => c.action === 'remove') || [];

                const linkedNpcAdditions = npcAddsFromAI.map(change => {
                    if (change.marker && typeof change.marker.x === 'number' && typeof change.marker.y === 'number') {
                        // Find a newly placed sprite that matches the marker's details.
                        const matchingSprite = currentPlacements.find(p => 
                            p.name === change.marker.name && 
                            p.x === change.marker.x && 
                            p.y === change.marker.y &&
                            // Ensure we don't link to an already-marked sprite
                            !worldMapManager.npcMarkers.some(m => m.spriteInstanceId === p.instanceId)
                        );
                        if(matchingSprite) {
                            const newChange: WorldMapNPCMarkerChange = {
                                ...change,
                                marker: {
                                    ...change.marker,
                                    name: change.marker.name,
                                    x: change.marker.x,
                                    y: change.marker.y,
                                    spriteInstanceId: matchingSprite.instanceId,
                                }
                            };
                            return newChange;
                        }
                    }
                    addSystemMessageToLog(`[Controller Warning] Could not link World Map Marker for '${change.marker?.name}' at (${change.marker?.x}, ${change.marker?.y}) to a newly placed sprite.`);
                    return null;
                }).filter((c): c is WorldMapNPCMarkerChange => c !== null);

                const allNpcMarkerChanges = [...linkedNpcAdditions, ...npcRemovalsFromAI, ...npcMarkerUpdatesFromMovement];
                worldMapManager.processWorldMapChanges(
                    parsed.worldMapZoneChanges, 
                    allNpcMarkerChanges,
                    parsed.worldMapWeatherZoneChanges
                );

            } else { setError("Failed to parse AI response."); addSystemMessageToLog(`Malformed JSON from AI. Raw: ${resultText.substring(0,200)}...`); }
        }
    } catch (e: any) {
        setError(`AI Error: ${e.message}`);
        addSystemMessageToLog(`Error processing AI response: ${e.message}`);
    } finally {
        setIsProcessingTurn(false);
    }
  }, [
      addGameMessageToChat, addSystemMessageToLog, gameStateManager, gameSessionManager,
      spriteSystemAI, worldMapManager, camera, setTimeOfDay, playerPosition
  ]);

  const handleContinueStory = useCallback(() => {
    handleSendMessage(CONTINUE_STORY_PROMPT, true);
  }, [handleSendMessage]);

  return { isProcessingTurn, error, handleSendMessage, handleContinueStory, setPlayerPosition, playerPosition };
};