import { PlayerParameter, ParameterChange } from '../types';
import { generateId } from './utils';

export const processParameterChanges = (
  currentParameters: PlayerParameter[],
  changes: ParameterChange[]
): PlayerParameter[] => {
  let newParameters = [...currentParameters];
  if (!Array.isArray(changes)) return newParameters;

  changes.forEach(change => {
    if (!change || typeof change.action !== 'string') return;
    
    const findByName = change.parameterName || change.parameter?.name;
    if (!findByName) return;

    const paramIndex = newParameters.findIndex(p => p.name.toLowerCase() === findByName.toLowerCase());

    switch (change.action) {
      case 'add':
        if (paramIndex === -1 && change.parameter) {
          newParameters.push({ ...change.parameter, id: generateId('param') });
        }
        break;
      case 'remove':
        if (paramIndex > -1) {
          newParameters.splice(paramIndex, 1);
        }
        break;
      case 'update':
        if (paramIndex > -1) {
          if (change.newValue !== undefined) {
            newParameters[paramIndex].value = change.newValue;
          }
          if (change.changes) {
            newParameters[paramIndex] = { ...newParameters[paramIndex], ...change.changes };
          }
        }
        break;
    }
  });
  return newParameters;
};
