import { Quest, CharacterNote, QuestChange, CharacterNoteChange } from '../types';
import { generateId } from './utils';

const formatQuestReward = (reward: any): string => {
  if (!reward) return '';
  if (typeof reward === 'string') return reward;
  if (typeof reward === 'object' && reward !== null) {
    return 'A complex reward';
  }
  return '';
};

export const processQuestChanges = (currentQuests: Quest[], changes: QuestChange[]): Quest[] => {
    let newQuests = [...currentQuests];
    if (!Array.isArray(changes)) return newQuests;
    
    changes.forEach(change => {
        if (!change || typeof change.action !== 'string') return;
        const titleForFind = change.questTitle || change.quest?.title;
        const questIndex = titleForFind ? newQuests.findIndex(q => q.title.toLowerCase() === titleForFind.toLowerCase()) : -1;

        switch (change.action) {
            case 'add':
                if (change.quest && questIndex === -1 && typeof change.quest.title === 'string') {
                     newQuests.push({
                        id: generateId('quest'),
                        title: change.quest.title,
                        description: change.quest.description || '',
                        status: change.quest.status || 'active',
                        reward: formatQuestReward(change.quest.reward),
                    });
                }
                break;
            case 'remove':
                if (questIndex > -1) {
                    newQuests.splice(questIndex, 1);
                }
                break;
            case 'update':
                if (questIndex > -1 && change.changes) {
                    newQuests[questIndex] = { ...newQuests[questIndex], ...change.changes };
                    if (change.changes.reward) {
                      newQuests[questIndex].reward = formatQuestReward(change.changes.reward);
                    }
                }
                break;
        }
    });
    return newQuests;
};

export const processCharacterNoteChanges = (currentNotes: CharacterNote[], changes: CharacterNoteChange[]): CharacterNote[] => {
    let newNotes = [...currentNotes];
    if (!Array.isArray(changes)) return newNotes;

    changes.forEach(change => {
        if (!change || typeof change.action !== 'string') return;
        const nameForFind = change.characterName || change.characterNote?.name;
        const noteIndex = nameForFind ? newNotes.findIndex(n => n.name.toLowerCase() === nameForFind.toLowerCase()) : -1;

        switch (change.action) {
            case 'add':
                if (change.characterNote && noteIndex === -1 && typeof change.characterNote.name === 'string') {
                    newNotes.push({
                        id: generateId('charNote'),
                        name: change.characterNote.name,
                        description: change.characterNote.description || ''
                    });
                }
                break;
            case 'remove':
                if (noteIndex > -1) {
                    newNotes.splice(noteIndex, 1);
                }
                break;
            case 'update':
                if (noteIndex > -1 && change.changes) {
                    newNotes[noteIndex] = { ...newNotes[noteIndex], ...change.changes };
                }
                break;
        }
    });
    return newNotes;
};