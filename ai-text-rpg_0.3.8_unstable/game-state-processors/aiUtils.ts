



import { PlacedSprite, SpriteDefinition, WorldMapZone, WorldMapNPCMarker, WorldMapWeatherZone } from '../types';
import { GAME_GRID_WIDTH, GAME_GRID_HEIGHT } from '../constants/gameConfig';

export const compressPlacedSpritesForPrompt = (
    placedSprites: PlacedSprite[],
    spriteDefinitions: SpriteDefinition[]
): string => {
    if (!placedSprites || placedSprites.length === 0) return "None";

    const defMap = new Map(spriteDefinitions.map(def => [def.id, def]));

    // Find boundaries of the sprites to create a dynamic grid
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    placedSprites.forEach(s => {
        minX = Math.min(minX, s.x);
        minY = Math.min(minY, s.y);
        maxX = Math.max(maxX, s.x);
        maxY = Math.max(maxY, s.y);
    });

    if (minX > maxX) return "None"; // No sprites with valid coordinates

    const gridWidth = maxX - minX + 1;
    const gridHeight = maxY - minY + 1;

    const grid: (string | null)[][] = Array.from({ length: gridHeight }, () => 
        Array(gridWidth).fill(null)
    );

    const sortedSprites = [...placedSprites].sort((a, b) => (a.layer || 0) - (b.layer || 0));

    sortedSprites.forEach(sprite => {
        const gridX = sprite.x - minX;
        const gridY = sprite.y - minY;
        const def = defMap.get(sprite.spriteDefinitionId);
        let nameWithModule = sprite.name;
        if (def?.modules) {
            const moduleStrings: string[] = [];
            if (def.modules.collision?.isSolid) moduleStrings.push('collision');
            if (def.modules.light) moduleStrings.push(`light(${def.modules.light.color})`);
            if (moduleStrings.length > 0) nameWithModule += ` [${moduleStrings.join(',')}]`;
        }
        grid[gridY][gridX] = nameWithModule;
    });

    const areasByName = new Map<string, string[]>();

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const spriteNameWithModule = grid[y][x];
            if (spriteNameWithModule) {
                if (!areasByName.has(spriteNameWithModule)) {
                    areasByName.set(spriteNameWithModule, []);
                }
                areasByName.get(spriteNameWithModule)!.push(`(${(x + minX)},${(y + minY)})`);
            }
        }
    }
    
    const compressedStrings: string[] = [];
    for (const [name, coords] of areasByName.entries()) {
         compressedStrings.push(`${name}: ${coords.join('; ')}`);
    }

    return compressedStrings.join('\n') || "None";
};

export const compressWorldMapZonesForPrompt = (zones: WorldMapZone[]): string => {
    if (!zones || zones.length === 0) return "None";
    return zones.map(z => `${z.name} (${z.type}) [${z.area.x},${z.area.y},${z.area.width},${z.area.height}]`).join('; ');
};

export const compressWorldMapWeatherZonesForPrompt = (zones: WorldMapWeatherZone[]): string => {
    if (!zones || zones.length === 0) return "None";
    return zones.map(z => `${z.temperature}°C [${z.area.x},${z.area.y},${z.area.width},${z.area.height}]`).join('; ');
}

export const compressWorldMapNPCsForPrompt = (markers: WorldMapNPCMarker[]): string => {
    if (!markers || markers.length === 0) return "None";
    return markers.map(m => `${m.name} @ (${m.x},${m.y})`).join('; ');
};


export const parseAIJsonResponse = <T>(responseText: string | undefined, context?: string): T | null => {
    if (!responseText) return null;
    let processedText = responseText.trim();

    const fenceMatch = processedText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (fenceMatch && fenceMatch[1]) {
        processedText = fenceMatch[1].trim();
    }

    const jsonStart = processedText.indexOf('{');
    if (jsonStart > 0) {
        processedText = processedText.substring(jsonStart);
    }
    
    try {
        return JSON.parse(processedText) as T;
    } catch (e: any) { 
        console.error(`Failed to parse JSON from AI context: [${context || 'general'}]. Error: ${e.message}. Processed Snippet: ${processedText.substring(0,150)}`);
        return null;
    }
};

export const contextAssessorAIConfig = { maxOutputTokens: 4096 };
export const spriteDefinerAIConfig = { maxOutputTokens: 3000 };
export const spriteMoverAIConfig = { maxOutputTokens: 2048 };
export const spritePlacementAIConfig = { maxOutputTokens: 8000 };