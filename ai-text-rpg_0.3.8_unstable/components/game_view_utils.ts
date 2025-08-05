import { SpriteShapeParams, ShapeType, NoiseType, SpriteDefinition, LightModule } from '../types';
import { SPRITE_CELL_SIZE, CHARACTER_KEYWORDS } from '../constants/gameConfig';

export const initializeCanvas = (canvas: HTMLCanvasElement, width: number, height: number) => {
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
};

export const adjustColor = (hex: string, amount: number): string => {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
        return '#000000';
    }
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const applyProceduralTexture = (
    ctx: CanvasRenderingContext2D,
    shapeType: ShapeType,
    textureType: string,
    x: number, y: number,
    width: number, height: number,
    baseColor: string
) => {
    const originalGlobalAlpha = ctx.globalAlpha;
    switch (textureType) {
        case 'wood_grain':
        case 'wood_planks':
            const numPlankLines = Math.max(1, Math.floor(width / (SPRITE_CELL_SIZE * 0.33)));
            const plankWidthEst = width / numPlankLines;
            const lineColor = adjustColor(baseColor, -20);
            
            ctx.fillStyle = lineColor;
            ctx.globalAlpha = 0.6;
            for (let i = 1; i < numPlankLines; i++) {
                ctx.fillRect(x + Math.floor(i * plankWidthEst), y, 1, height);
            }
            ctx.globalAlpha = originalGlobalAlpha;
            generateSimpleNoisePattern(ctx, x, y, width, height, 'simple_fractal', 0.15, 0.03, adjustColor(baseColor, (Math.random() > 0.5 ? 8 : -8)));
            const ditherGrainColor = adjustColor(baseColor, -15 + (Math.random() * 10 - 5));
            generateSimpleNoisePattern(ctx, x, y, width, height, 'pixel_dither', 0.4 + Math.random() * 0.2, 0.15 + Math.random() * 0.1, ditherGrainColor);
            break;

        case 'stone_wall':
        case 'rough_stone':
            generateSimpleNoisePattern(ctx, x, y, width, height, 'cellular', 0.2, 0.1, adjustColor(baseColor, (Math.random() > 0.5 ? 5 : -5)));
            const stoneShade1 = adjustColor(baseColor, -15);
            const stoneShade2 = adjustColor(baseColor, 10);
            generateSimpleNoisePattern(ctx, x, y, width, height, 'pixel_dither', 0.6, 0.15, stoneShade1);
            generateSimpleNoisePattern(ctx, x, y, width, height, 'pixel_dither', 0.4, 0.1, stoneShade2);
            break;
    }
};

export const generateSimpleNoisePattern = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    width: number, height: number,
    noiseType: NoiseType,
    scaleInput: number | undefined,
    strengthInput: number | undefined,
    noiseColorOverride?: string
) => {
    const scale = scaleInput ?? 0.1;
    const strength = strengthInput ?? 0.5;

    if (noiseType === 'none' || strength === 0) return;

    const originalCompositeOp = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'source-atop';

    if (noiseType === 'pixel_dither') {
        const basePixelSize = (scale < 0.2) ? 4 : (scale < 0.4) ? 3 : (scale < 0.7) ? 2 : 1;
        const pixelSize = Math.max(1, Math.floor(basePixelSize));
        const ditherDensity = Math.random() * 0.25 + 0.10;

        for (let px = 0; px < width; px += pixelSize) {
            for (let py = 0; py < height; py += pixelSize) {
                if (Math.random() < ditherDensity) {
                    const ditherAlpha = (0.1 + Math.random() * 0.4) * strength;
                    ctx.fillStyle = noiseColorOverride 
                        ? `rgba(${parseInt(noiseColorOverride.slice(1,3),16)},${parseInt(noiseColorOverride.slice(3,5),16)},${parseInt(noiseColorOverride.slice(5,7),16)},${ditherAlpha})` 
                        : `rgba(0,0,0,${ditherAlpha})`;
                    ctx.fillRect(x + px, y + py, pixelSize, pixelSize);
                }
            }
        }
    }
    ctx.globalCompositeOperation = originalCompositeOp;
};

export const renderSpriteShapeOnCanvas = (
    mainCtx: CanvasRenderingContext2D,
    shapeParams: SpriteShapeParams,
    canvasCellX: number,
    canvasCellY: number,
    layer: number = 0,
    shapeCache: Map<string, HTMLCanvasElement>,
    timestamp: DOMHighResTimeStamp
) => {
    const { type, sizeRatios, color, offsetXRatio, offsetYRatio, rotation, opacity, noise, texture, topWidthRatio } = shapeParams;
    const shapeWidth = Math.max(1, Math.floor(SPRITE_CELL_SIZE * sizeRatios.w));
    const shapeHeight = Math.max(1, Math.floor(SPRITE_CELL_SIZE * sizeRatios.h));

    const cacheKey = `shape-${type}-${shapeWidth}x${shapeHeight}-${color}-${texture || 'none'}-${noise?.type || 'none'}-${topWidthRatio || 1}`;
    let renderedShapeCanvas = shapeCache.get(cacheKey);

    if (!renderedShapeCanvas) {
        renderedShapeCanvas = document.createElement('canvas');
        renderedShapeCanvas.width = shapeWidth;
        renderedShapeCanvas.height = shapeHeight;
        const renderCtx = renderedShapeCanvas.getContext('2d');
        if (!renderCtx) return;

        renderCtx.fillStyle = color;
        renderCtx.beginPath();
        switch (type) {
            case 'cube': renderCtx.rect(0, 0, shapeWidth, shapeHeight); break;
            case 'circle': renderCtx.ellipse(shapeWidth / 2, shapeHeight / 2, shapeWidth / 2, shapeHeight / 2, 0, 0, Math.PI * 2); break;
            case 'rhombus':
                renderCtx.moveTo(shapeWidth / 2, 0); renderCtx.lineTo(shapeWidth, shapeHeight / 2);
                renderCtx.lineTo(shapeWidth / 2, shapeHeight); renderCtx.lineTo(0, shapeHeight / 2);
                renderCtx.closePath(); break;
            case 'triangle':
                renderCtx.moveTo(shapeWidth / 2, 0); renderCtx.lineTo(shapeWidth, shapeHeight);
                renderCtx.lineTo(0, shapeHeight); renderCtx.closePath(); break;
            case 'trapezoid':
                const actualTopWidth = shapeWidth * (topWidthRatio ?? 1.0);
                const xOffset = (shapeWidth - actualTopWidth) / 2;
                renderCtx.moveTo(xOffset, 0);
                renderCtx.lineTo(xOffset + actualTopWidth, 0);
                renderCtx.lineTo(shapeWidth, shapeHeight);
                renderCtx.lineTo(0, shapeHeight);
                renderCtx.closePath();
                break;
        }
        renderCtx.fill();
        if (texture) applyProceduralTexture(renderCtx, type, texture, 0, 0, shapeWidth, shapeHeight, color);
        if (noise) generateSimpleNoisePattern(renderCtx, 0, 0, shapeWidth, shapeHeight, noise.type, noise.scale, noise.strength);
        shapeCache.set(cacheKey, renderedShapeCanvas);
    }
    
    const centerX = canvasCellX * SPRITE_CELL_SIZE + SPRITE_CELL_SIZE / 2 + offsetXRatio * SPRITE_CELL_SIZE;
    const centerY = canvasCellY * SPRITE_CELL_SIZE + SPRITE_CELL_SIZE / 2 + offsetYRatio * SPRITE_CELL_SIZE;
    const currentOpacity = opacity ?? 1.0;

    // --- Draw Shadow ---
    if (layer >= 2 && currentOpacity > 0.1) {
        mainCtx.save();
        mainCtx.globalAlpha = 0.35 * currentOpacity;
        mainCtx.fillStyle = '#000';
        mainCtx.filter = 'blur(2px)';
        mainCtx.translate(centerX + 2, centerY + 3);
        mainCtx.rotate((rotation ?? 0) * Math.PI / 180);
        mainCtx.drawImage(renderedShapeCanvas, -shapeWidth / 2, -shapeHeight / 2, shapeWidth, shapeHeight);
        mainCtx.restore();
    }
    
    // --- Draw Main Shape ---
    mainCtx.save();
    mainCtx.globalAlpha = currentOpacity;
    mainCtx.translate(centerX, centerY);
    mainCtx.rotate((rotation ?? 0) * Math.PI / 180);
    mainCtx.drawImage(renderedShapeCanvas, -shapeWidth / 2, -shapeHeight / 2, shapeWidth, shapeHeight);
    mainCtx.restore();
};

export const renderLightSource = (
    ctx: CanvasRenderingContext2D,
    canvasCellX: number,
    canvasCellY: number,
    lightModule: LightModule,
    timestamp: DOMHighResTimeStamp
) => {
    let { color, range, intensity, pulse } = lightModule;
    if (!color || !/^#([0-9a-fA-F]{3}){1,2}$/.test(color)) color = '#FFFFFF';
    
    const centerX = (canvasCellX + 0.5) * SPRITE_CELL_SIZE;
    const centerY = (canvasCellY + 0.5) * SPRITE_CELL_SIZE;

    if (pulse) intensity *= (0.85 + Math.sin(timestamp / 200 + centerX + centerY) * 0.15);
    if (intensity <= 0) return;

    const radius = range * SPRITE_CELL_SIZE;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    
    let r = parseInt(color.slice(1, 3), 16), g = parseInt(color.slice(3, 5), 16), b = parseInt(color.slice(5, 7), 16);
    if (color.length === 4) { r = parseInt(color[1]+color[1], 16); g = parseInt(color[2]+color[2], 16); b = parseInt(color[3]+color[3], 16); }

    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${intensity * 0.7})`);
    gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${intensity * 0.3})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
};

export const renderCharacterNameOnCanvas = (
    ctx: CanvasRenderingContext2D,
    definition: SpriteDefinition,
    canvasCellX: number,
    canvasCellY: number,
) => {
    let isLikelyCharacter = definition.isPlayerCandidate || false;
    if (!isLikelyCharacter && definition.name) {
        const nameLower = definition.name.toLowerCase();
        isLikelyCharacter = CHARACTER_KEYWORDS.some(term => nameLower.includes(term.toLowerCase()));
    }

    if (isLikelyCharacter) {
        ctx.fillStyle = '#e2e8f0'; 
        ctx.font = 'bold 9px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = "rgba(0,0,0,0.7)";
        ctx.shadowBlur = 2; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
        
        const textX = canvasCellX * SPRITE_CELL_SIZE + SPRITE_CELL_SIZE / 2;
        const spriteTopY = canvasCellY * SPRITE_CELL_SIZE;
        const textY = spriteTopY - 4; 
        
        ctx.fillText(definition.name, textX, Math.max(9, textY)); 
        ctx.shadowColor = "transparent";
    }
};

export const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#374151'; 
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= width; x += SPRITE_CELL_SIZE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y <= height; y += SPRITE_CELL_SIZE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
};

export const sortSpritesForRendering = (
    placedSprites: any[],
): any[] => {
    return [...placedSprites].sort((a, b) => {
        const layerA = a.layer ?? 0;
        const layerB = b.layer ?? 0;
        if (layerA !== layerB) return layerA - layerB;
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
    });
};