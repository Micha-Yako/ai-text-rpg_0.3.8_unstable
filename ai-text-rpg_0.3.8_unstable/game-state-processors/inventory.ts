import { Item, InventoryChange, ItemEffect } from '../types';
import { generateId } from './utils';

export const getBonusCapacity = (currentInventory: Item[]): number => {
    const equippedItems = currentInventory.filter(item => item.isEquipped);
    let bonus = 0;
    equippedItems.forEach(item => {
        if (item.effects) {
            item.effects.forEach((effect: ItemEffect) => {
                if (effect.type === 'capacity_modifier') {
                    bonus += effect.value;
                }
            });
        }
    });
    return bonus;
};

export const processInventoryChanges = (
  currentInventory: Item[],
  changes: InventoryChange[],
  baseCapacity: number,
  addSystemMessage: (text: string) => void,
  addGameMessage?: (sender: 'system', text: string) => void
): Item[] => {
  let workingInventory = [...currentInventory];
  if (!Array.isArray(changes) || changes.length === 0) return workingInventory;

  changes.forEach(change => {
    if (!change || typeof change.action !== 'string') return;

    switch (change.action) {
      case 'add': {
        if (change.item) {
          const sanitizedItem: Omit<Item, 'id'> = { name: change.item.name, description: change.item.description, quantity: change.item.quantity || 1, size: change.item.size || 1, isEquipped: change.item.isEquipped, effects: change.item.effects };
          const existingItemIndex = workingInventory.findIndex(i => i.name.toLowerCase() === sanitizedItem.name.toLowerCase());
          if (existingItemIndex > -1) {
            workingInventory[existingItemIndex].quantity += sanitizedItem.quantity;
          } else {
            const currentTotalSize = workingInventory.filter(i => !i.isEquipped).reduce((acc, curr) => acc + ((curr.size || 1) * curr.quantity), 0);
            const sizeOfNewItems = (sanitizedItem.size || 1) * sanitizedItem.quantity;
            if (sanitizedItem.isEquipped || (currentTotalSize + sizeOfNewItems <= baseCapacity + getBonusCapacity(workingInventory))) {
              workingInventory.push({ ...sanitizedItem, id: generateId('item') });
            } else {
                const message = `You try to pick up the ${sanitizedItem.name}, but it's too heavy for your pack.`;
                addSystemMessage(message);
                if (addGameMessage) addGameMessage('system', message);
            }
          }
        }
        break;
      }
      case 'remove':
        if (change.itemName) {
          const itemIndex = workingInventory.findIndex(i => i.name.toLowerCase() === change.itemName!.toLowerCase());
          if (itemIndex > -1) {
            const quantityToRemove = change.quantity || 1;
            if (workingInventory[itemIndex].quantity > quantityToRemove) {
              workingInventory[itemIndex].quantity -= quantityToRemove;
            } else {
              workingInventory.splice(itemIndex, 1);
            }
          }
        }
        break;
      case 'update':
        if (change.itemName && change.changes) {
          const itemIndex = workingInventory.findIndex(i => i.name.toLowerCase() === change.itemName!.toLowerCase());
          if (itemIndex > -1) {
            workingInventory[itemIndex] = { ...workingInventory[itemIndex], ...change.changes };
          }
        }
        break;
    }
  });
  return workingInventory;
};