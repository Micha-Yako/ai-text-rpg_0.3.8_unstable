import React, { useEffect, useRef, useCallback } from 'react';
import { SpriteDefinition, PlacedSprite } from '../types';
import { GAME_GRID_WIDTH, GAME_GRID_HEIGHT, SPRITE_CELL_SIZE } from '../constants/gameConfig';
import { MapIcon, SparklesIcon } from './Icons';
import {
  drawGrid,
  renderSpriteShapeOnCanvas,
  renderCharacterNameOnCanvas,
  sortSpritesForRendering,
  renderLightSource,
  initializeCanvas,
} from './game_view_utils';

interface GameViewProps {
  spriteDefinitions: SpriteDefinition[];
  placedSprites: PlacedSprite[];
  camera: { x: number, y: number };
  isLoading: boolean;
  currentLocationName: string;
  timeOfDay: 'sun' | 'night' | 'normal';
}

export const GameView: React.FC<GameViewProps> = ({ 
  spriteDefinitions, 
  placedSprites, 
  camera,
  isLoading, 
  currentLocationName, 
  timeOfDay 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | undefined>(undefined);
  const localShapeRenderCache = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const lightCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    localShapeRenderCache.current.clear();
  }, [spriteDefinitions, currentLocationName]);

  const drawGame = useCallback((timestamp: DOMHighResTimeStamp) => {
    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return;
    const mainCtx = mainCanvas.getContext('2d');
    if (!mainCtx) return;

    // Initialize canvases if not done
    const canvasWidth = GAME_GRID_WIDTH * SPRITE_CELL_SIZE;
    const canvasHeight = GAME_GRID_HEIGHT * SPRITE_CELL_SIZE;
    initializeCanvas(mainCanvas, canvasWidth, canvasHeight);
    if (!lightCanvasRef.current) {
        lightCanvasRef.current = document.createElement('canvas');
    }
    const lightCanvas = lightCanvasRef.current;
    initializeCanvas(lightCanvas, canvasWidth, canvasHeight);
    const lightCtx = lightCanvas.getContext('2d');
    if (!lightCtx) return;
    
    // --- Main canvas drawing ---
    mainCtx.fillStyle = '#1e293b';
    mainCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    drawGrid(mainCtx, canvasWidth, canvasHeight);

    const visibleSprites = placedSprites.filter(sprite =>
      sprite.x >= camera.x - 2 &&
      sprite.x < camera.x + GAME_GRID_WIDTH + 2 &&
      sprite.y >= camera.y - 2 &&
      sprite.y < camera.y + GAME_GRID_HEIGHT + 2
    );

    const sortedSprites = sortSpritesForRendering(visibleSprites);

    sortedSprites.forEach(ps => {
      const definition = spriteDefinitions.find(def => def.id === ps.spriteDefinitionId);
      const canvasX = ps.x - camera.x;
      const canvasY = ps.y - camera.y;
      
      if (definition) {
        const sortedShapes = [...definition.shapes].sort((sA, sB) => (sA.zIndex || 0) - (sB.zIndex || 0));
        sortedShapes.forEach(shape => {
          renderSpriteShapeOnCanvas(mainCtx, shape, canvasX, canvasY, ps.layer, localShapeRenderCache.current, timestamp);
        });
        renderCharacterNameOnCanvas(mainCtx, definition, canvasX, canvasY);
      } else {
        mainCtx.fillStyle = 'magenta'; mainCtx.fillRect(canvasX * SPRITE_CELL_SIZE + 5, canvasY * SPRITE_CELL_SIZE + 5, SPRITE_CELL_SIZE - 10, SPRITE_CELL_SIZE - 10);
        mainCtx.fillStyle = 'white'; mainCtx.font = '8px Arial'; mainCtx.textAlign = 'center';
        mainCtx.fillText("ERR", canvasX * SPRITE_CELL_SIZE + SPRITE_CELL_SIZE / 2, canvasY * SPRITE_CELL_SIZE + SPRITE_CELL_SIZE / 2);
      }
    });

    // --- Light canvas drawing ---
    // 1. Fill with ambient light
    lightCtx.globalCompositeOperation = 'source-over';
    lightCtx.fillStyle = timeOfDay === 'sun' ? '#FFFFF0' : timeOfDay === 'night' ? '#202028' : '#404040';
    lightCtx.fillRect(0,0, canvasWidth, canvasHeight);
        
    // 2. Add light sources
    lightCtx.globalCompositeOperation = 'lighter';
    sortedSprites.forEach(ps => {
        const definition = spriteDefinitions.find(def => def.id === ps.spriteDefinitionId);
        if(definition?.modules?.light) {
            renderLightSource(lightCtx, ps.x - camera.x, ps.y - camera.y, definition.modules.light, timestamp);
        }
    });

    // --- Blend light canvas onto main canvas ---
    mainCtx.globalCompositeOperation = 'multiply';
    mainCtx.drawImage(lightCanvas, 0, 0);
    mainCtx.globalCompositeOperation = 'source-over'; // Reset

    animationFrameId.current = requestAnimationFrame(drawGame);
  }, [spriteDefinitions, placedSprites, camera, timeOfDay]);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(drawGame);
    return () => {
      if (animationFrameId.current !== undefined) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [drawGame]);

  return (
    <div className="bg-slate-900 p-1 sm:p-2 md:p-3 rounded-lg shadow-xl h-full flex flex-col items-center overflow-hidden">
      <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-lime-400 flex items-center self-start px-1 sm:px-0 flex-shrink-0">
        <MapIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2" /> 
        Location: <span className="text-teal-400 ml-1.5">{currentLocationName || "Loading..."}</span>
        {isLoading && <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2 text-lime-400 animate-pulse" />}
      </h2>
      <div 
        className="flex-grow w-full bg-slate-800 rounded shadow-inner flex items-center justify-center overflow-hidden"
      >
        {(placedSprites.length === 0 && !isLoading) ? (
          <div className="text-center text-slate-400 italic p-4 max-w-sm mx-auto">
             <MapIcon className="w-16 h-16 mx-auto mb-3 text-slate-600" />
            <p className="text-sm">The world is a blank canvas.</p>
            <p className="text-xs mt-1">
                Start your adventure or use "Calibrate World" to help the AI draw the initial scene.
            </p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="border border-slate-700"
            style={{ imageRendering: 'pixelated' }} 
          />
        )}
      </div>
    </div>
  );
};