import { StatusEffect, StatusEffectChange } from '../types';
import { generateId } from './utils';

export const processStatusEffectChanges = (
  currentEffects: StatusEffect[],
  changes: StatusEffectChange[]
): StatusEffect[] => {
  let newEffects = [...currentEffects];
  if (!Array.isArray(changes)) return newEffects;

  changes.forEach(change => {
    if (!change || typeof change.action !== 'string') return;

    switch (change.action) {
      case 'add': {
        if (change.effect && typeof change.effect.name === 'string') {
          const existingEffectIndex = newEffects.findIndex(e => e.name.toLowerCase() === change.effect!.name.toLowerCase());
          const newEffectData: StatusEffect = {
            id: generateId('effect'),
            name: change.effect.name,
            description: change.effect.description || '',
            targetParameterName: change.effect.targetParameterName || '',
            modifier: change.effect.modifier || 0,
            duration: change.effect.duration || -1,
          };
          if (existingEffectIndex > -1) {
            newEffects[existingEffectIndex] = { ...newEffects[existingEffectIndex], ...newEffectData };
          } else {
            newEffects.push(newEffectData);
          }
        }
        break;
      }
      case 'remove':
        if (change.effectName) {
          newEffects = newEffects.filter(e => e.name.toLowerCase() !== change.effectName!.toLowerCase());
        }
        break;
      case 'update':
        if (change.effectName && change.changes) {
          const effectIndex = newEffects.findIndex(e => e.name.toLowerCase() === change.effectName!.toLowerCase());
          if (effectIndex > -1) {
            newEffects[effectIndex] = { ...newEffects[effectIndex], ...change.changes };
          }
        }
        break;
    }
  });
  return newEffects;
};
