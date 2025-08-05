
import { useState, useCallback } from 'react';
import { useManualMode } from './useManualModeContext';
import { MANUAL_MODE_UBER_PROMPT } from '../constants';

export const useGameSessionManager = () => {
    const { requestManualResponse } = useManualMode();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // System prompt state is still needed for the settings panel
    const [systemPrompt, setSystemPrompt] = useState<string>(MANUAL_MODE_UBER_PROMPT);

    const sendChatMessageToAI = useCallback(async (
        prompt: string
    ): Promise<string | null> => {
        setIsLoading(true);
        setError(null);

        // The entire prompt is now built in the controller, but this function will use it to show the modal
        const manualResponseText = await requestManualResponse(prompt, 'GameMasterAI');
        setIsLoading(false);
        
        if (manualResponseText === null) {
            addSystemMessageToLog("Manual AI request cancelled by user.");
        }
        
        return manualResponseText; // Can be null if cancelled
        
    }, [requestManualResponse]);
    
    const addSystemMessageToLog = (text: string) => {
        // A dummy function to prevent crashes where it might be called.
        // The real logging is handled by gameStateManager.
        console.log(`[GameSessionManager Log]: ${text}`);
    };

    return {
        isLoading,
        error,
        systemPrompt,
        setSystemPrompt,
        sendChatMessageToAI,
    };
};
