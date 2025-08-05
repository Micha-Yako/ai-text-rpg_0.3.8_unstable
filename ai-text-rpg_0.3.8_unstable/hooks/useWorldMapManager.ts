





import { useState, useCallback } from 'react';
import { WorldMapZone, WorldMapNPCMarker, WorldMapZoneChange, WorldMapNPCMarkerChange, WorldMapWeatherZone, WorldMapWeatherZoneChange } from '../types';
import { generateId } from '../game-state-processors/utils';

export const useWorldMapManager = () => {
  const [zones, setZones] = useState<WorldMapZone[]>([]);
  const [npcMarkers, setNpcMarkers] = useState<WorldMapNPCMarker[]>([]);
  const [weatherZones, setWeatherZones] = useState<WorldMapWeatherZone[]>([]);

  const processWorldMapChanges = useCallback((
    zoneChanges: WorldMapZoneChange[] = [],
    npcMarkerChanges: WorldMapNPCMarkerChange[] = [],
    weatherZoneChanges: WorldMapWeatherZoneChange[] = [],
  ) => {
    // Process Zone Changes
    if (zoneChanges?.length) {
      setZones(currentZones => {
        let newZones = [...currentZones];
        zoneChanges.forEach(change => {
          const findName = change.zoneName || change.zone?.name;
          const zoneIndex = findName ? newZones.findIndex(z => z.name.toLowerCase() === findName.toLowerCase()) : -1;

          switch (change.action) {
            case 'add':
              if (change.zone && zoneIndex === -1) {
                newZones.push({
                  id: generateId('zone'),
                  ...change.zone,
                  type: change.zone.type || 'other', // Ensure type has a fallback
                });
              }
              break;
            case 'remove':
              if (zoneIndex > -1) newZones.splice(zoneIndex, 1);
              break;
            case 'update':
              if (zoneIndex > -1 && change.changes) {
                newZones[zoneIndex] = { ...newZones[zoneIndex], ...change.changes };
              }
              break;
          }
        });
        return newZones;
      });
    }

    // Process NPC Marker Changes
    if (npcMarkerChanges?.length) {
      setNpcMarkers(currentMarkers => {
        let newMarkers = [...currentMarkers];
        npcMarkerChanges.forEach(change => {
          const findId = change.markerId;
          const findName = change.markerName || change.marker?.name;
          let markerIndex = -1;
          if (findId) {
            markerIndex = newMarkers.findIndex(m => m.id === findId);
          } else if (findName) {
            markerIndex = newMarkers.findIndex(m => m.name.toLowerCase() === findName.toLowerCase());
          }

          switch (change.action) {
            case 'add':
              if (change.marker && 
                  typeof change.marker.name === 'string' &&
                  typeof change.marker.x === 'number' &&
                  typeof change.marker.y === 'number' &&
                  typeof change.marker.spriteInstanceId === 'string') {

                const markerNameLower = change.marker.name.toLowerCase();
                const isMerchant = markerNameLower.includes('merchant') || markerNameLower.includes('shopkeeper') || markerNameLower.includes('vendor');

                const newMarker: WorldMapNPCMarker = {
                    id: generateId('marker'),
                    name: change.marker.name,
                    x: change.marker.x,
                    y: change.marker.y,
                    spriteInstanceId: change.marker.spriteInstanceId,
                    markerType: isMerchant ? 'merchant' : 'npc',
                };
                newMarkers.push(newMarker);
              }
              break;
            case 'remove':
              if (markerIndex > -1) newMarkers.splice(markerIndex, 1);
              break;
            case 'update':
              if (markerIndex > -1 && change.changes) {
                newMarkers[markerIndex] = { ...newMarkers[markerIndex], ...change.changes };
              }
              break;
          }
        });
        return newMarkers;
      });
    }

    // Process Weather Zone Changes
    if (weatherZoneChanges?.length) {
      setWeatherZones(currentZones => {
          let newWeatherZones = [...currentZones];
          weatherZoneChanges.forEach(change => {
              const findId = change.zoneId;
              const zoneIndex = findId ? newWeatherZones.findIndex(z => z.id === findId) : -1;

              switch (change.action) {
                  case 'add':
                      if (change.zone) {
                          newWeatherZones.push({ ...change.zone, id: generateId('wzone') });
                      }
                      break;
                  case 'remove':
                      if (zoneIndex > -1) newWeatherZones.splice(zoneIndex, 1);
                      break;
                  case 'update':
                      if (zoneIndex > -1 && change.changes) {
                          newWeatherZones[zoneIndex] = { ...newWeatherZones[zoneIndex], ...change.changes };
                      }
                      break;
              }
          });
          return newWeatherZones;
      });
    }

  }, []);

  const resetWorldMap = useCallback(() => {
    setZones([]);
    setNpcMarkers([]);
    setWeatherZones([]);
  }, []);

  return {
    zones,
    npcMarkers,
    weatherZones,
    processWorldMapChanges,
    resetWorldMap,
  };
};