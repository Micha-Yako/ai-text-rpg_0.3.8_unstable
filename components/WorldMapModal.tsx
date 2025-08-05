





import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { WorldMapZone, WorldMapNPCMarker, WorldMapWeatherZone } from '../types';
import { XMarkIcon, UserCircleIcon, MapIcon } from './Icons';

interface WorldMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: WorldMapZone[];
  weatherZones: WorldMapWeatherZone[];
  markers: WorldMapNPCMarker[];
  playerPosition: { x: number, y: number };
}

interface Transform {
    scale: number;
    offsetX: number;
    offsetY: number;
}

const getTempColor = (temp: number): string => {
    if (temp <= 0) return `rgba(100, 180, 255, 0.3)`; // Cold blue
    if (temp <= 15) return `rgba(255, 255, 150, 0.3)`; // Mild yellow
    if (temp <= 25) return `rgba(255, 180, 100, 0.3)`; // Warm orange
    return `rgba(255, 100, 100, 0.3)`; // Hot red
}

const WorldMapModal: React.FC<WorldMapModalProps> = ({ isOpen, onClose, zones, weatherZones, markers, playerPosition }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [transform, setTransform] = useState<Transform>({ scale: 10, offsetX: 0, offsetY: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPosition = useRef({ x: 0, y: 0 });
  
  const worldBounds = useMemo(() => {
    if (zones.length === 0 && markers.length === 0 && weatherZones.length === 0) {
      return { minX: -10, minY: -10, maxX: 10, maxY: 10, width: 20, height: 20 };
    }
    let minX = playerPosition.x, minY = playerPosition.y, maxX = playerPosition.x, maxY = playerPosition.y;
    
    const allEntities = [...zones.map(z => z.area), ...weatherZones.map(z => z.area), ...markers.map(m => ({x:m.x, y:m.y, width:0, height:0}))];

    allEntities.forEach(e => {
      minX = Math.min(minX, e.x);
      minY = Math.min(minY, e.y);
      maxX = Math.max(maxX, e.x + (e.width || 0));
      maxY = Math.max(maxY, e.y + (e.height || 0));
    });

    const padding = 10;
    const finalMinX = minX - padding;
    const finalMinY = minY - padding;
    const finalMaxX = maxX + padding;
    const finalMaxY = maxY + padding;
    return { 
        minX: finalMinX, 
        minY: finalMinY, 
        maxX: finalMaxX, 
        maxY: finalMaxY,
        width: finalMaxX - finalMinX,
        height: finalMaxY - finalMinY
    };
  }, [zones, weatherZones, markers, playerPosition]);

  const resetView = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !worldBounds.width || !worldBounds.height) return;
    
    const parent = canvas.parentElement;
    if (!parent) return;

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    const scaleX = canvas.width / worldBounds.width;
    const scaleY = canvas.height / worldBounds.height;
    const scale = Math.min(scaleX, scaleY) * 0.9; 

    const offsetX = (canvas.width - worldBounds.width * scale) / 2 - worldBounds.minX * scale;
    const offsetY = (canvas.height - worldBounds.height * scale) / 2 - worldBounds.minY * scale;

    setTransform({ scale, offsetX, offsetY });
  }, [worldBounds]);

  useEffect(() => {
    if(isOpen) {
        // Timeout to allow modal to render and get parent dimensions
        setTimeout(resetView, 50);
    }
  }, [isOpen, resetView]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!isOpen || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const { scale, offsetX, offsetY } = transform;
    
    // Draw Weather Zones
    weatherZones.forEach(zone => {
        const { x, y, width, height } = zone.area;
        ctx.fillStyle = getTempColor(zone.temperature);
        ctx.fillRect(x * scale + offsetX, y * scale + offsetY, width * scale, height * scale);
        
        const fontSize = Math.max(10, 14 * (scale/10));
        if (fontSize > 5) {
            ctx.fillStyle = '#f1f5f9';
            ctx.globalAlpha = 0.6;
            ctx.font = `${fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${zone.temperature}°C`, (x + width / 2) * scale + offsetX, (y + height / 2) * scale + offsetY);
        }
    });

    // Draw Zones
    zones.forEach(zone => {
      const { x, y, width, height } = zone.area;
      ctx.fillStyle = zone.color || '#475569';
      ctx.globalAlpha = 0.5;
      ctx.fillRect(x * scale + offsetX, y * scale + offsetY, width * scale, height * scale);
      
      ctx.strokeStyle = '#94a3b8';
      ctx.globalAlpha = 0.8;
      ctx.strokeRect(x * scale + offsetX, y * scale + offsetY, width * scale, height * scale);

      const titleFontSize = Math.max(10, 12 * (scale/10));
      if (titleFontSize > 5) {
        ctx.fillStyle = '#f1f5f9';
        ctx.font = `bold ${titleFontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textX = (x + width / 2) * scale + offsetX;
        const textY = (y + height / 2) * scale + offsetY;
        ctx.fillText(zone.name, textX, textY - (titleFontSize / 2 + 1));
        
        const typeFontSize = Math.max(8, 10 * (scale/10));
        ctx.font = `${typeFontSize}px sans-serif`;
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`(${zone.type})`, textX, textY + (typeFontSize / 2 + 1));
      }
    });
    ctx.globalAlpha = 1.0;

    // Draw Markers
    markers.forEach(marker => {
      const markerSize = Math.max(3, 6 * (scale/10));
      ctx.fillStyle = marker.markerType === 'merchant' ? '#facc15' : '#f43f5e'; // gold vs rose
      ctx.beginPath();
      ctx.arc(marker.x * scale + offsetX, marker.y * scale + offsetY, markerSize, 0, Math.PI * 2);
      ctx.fill();

      const nameFontSize = Math.max(8, 10 * (scale/10));
      if (nameFontSize > 4) {
        ctx.fillStyle = '#f1f5f9';
        ctx.font = `${nameFontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(marker.name, marker.x * scale + offsetX, marker.y * scale + offsetY - markerSize - 2);
      }
    });
    
    // Draw Player
    const playerSize = Math.max(4, 8 * (scale/10));
    ctx.fillStyle = '#38bdf8'; // sky-400
    ctx.beginPath();
    ctx.arc(playerPosition.x * scale + offsetX, playerPosition.y * scale + offsetY, playerSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [isOpen, zones, weatherZones, markers, playerPosition, transform]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsPanning(true);
    lastPanPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPanning) return;
    const dx = e.clientX - lastPanPosition.current.x;
    const dy = e.clientY - lastPanPosition.current.y;
    lastPanPosition.current = { x: e.clientX, y: e.clientY };
    setTransform(prev => ({ ...prev, offsetX: prev.offsetX + dx, offsetY: prev.offsetY + dy }));
  };
  
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const newScale = e.deltaY < 0 ? transform.scale * zoomFactor : transform.scale / zoomFactor;

    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // World coordinates of the point under the mouse before zoom
    const worldX = (mouseX - transform.offsetX) / transform.scale;
    const worldY = (mouseY - transform.offsetY) / transform.scale;
    
    // New offset to keep the world point under the mouse
    const newOffsetX = mouseX - worldX * newScale;
    const newOffsetY = mouseY - worldY * newScale;

    setTransform({ scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY });
  };


  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-6xl h-[90vh] bg-slate-900 border border-slate-700 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                <MapIcon className="w-6 h-6" /> World Map
            </h2>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-700">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="flex-grow w-full h-full bg-slate-800 rounded shadow-inner overflow-hidden cursor-grab active:cursor-grabbing">
            <canvas 
                ref={canvasRef} 
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onMouseMove={handleMouseMove}
                onWheel={handleWheel}
            />
        </div>
        <div className="flex-shrink-0 mt-3 text-xs text-slate-400 flex justify-between items-center">
            <div className='flex items-center gap-x-4'>
                <span className='flex items-center'><span className="inline-block w-3 h-3 bg-sky-400 rounded-full mr-1.5 border border-white"></span> Player</span>
                <span className='flex items-center'><span className="inline-block w-3 h-3 bg-rose-500 rounded-full mr-1.5"></span> NPC</span>
                <span className='flex items-center'><span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-1.5"></span> Merchant</span>
            </div>
            <span>Use scroll to zoom and drag to pan.</span>
        </div>
      </div>
    </div>
  );
};

export default WorldMapModal;