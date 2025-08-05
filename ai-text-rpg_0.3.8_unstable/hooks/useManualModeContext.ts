
import React, { createContext, useContext, useState, ReactNode } from 'react';
import ManualModeModal from '../components/ManualModeModal';

interface ManualModeContextType {
    requestManualResponse: (prompt: string, context?: string) => Promise<string | null>;
}

const ManualModeContext = createContext<ManualModeContextType | undefined>(undefined);

export const useManualMode = (): ManualModeContextType => {
    const context = useContext(ManualModeContext);
    if (!context) {
        throw new Error('useManualMode must be used within a ManualModeProvider');
    }
    return context;
};

interface ManualModeProviderProps {
    children: ReactNode;
}

export const ManualModeProvider: React.FC<ManualModeProviderProps> = ({ children }) => {
    const [manualRequest, setManualRequest] = useState<{ prompt: string; context?: string; resolve: (response: string | null) => void; } | null>(null);

    const requestManualResponse = (prompt: string, context?: string): Promise<string | null> => {
        return new Promise((resolve) => {
            setManualRequest({ prompt, context, resolve });
        });
    };

    const handleResponse = (response: string) => {
        if (manualRequest) {
            manualRequest.resolve(response);
            setManualRequest(null);
        }
    };

    const handleCancel = () => {
        if (manualRequest) {
            manualRequest.resolve(null);
            setManualRequest(null);
        }
    };
    
    const value = { requestManualResponse };

    return React.createElement(ManualModeContext.Provider, { value: value },
        children,
        manualRequest ? React.createElement(ManualModeModal, {
            prompt: manualRequest.prompt,
            context: manualRequest.context,
            onRespond: handleResponse,
            onCancel: handleCancel,
        }) : null
    );
};
