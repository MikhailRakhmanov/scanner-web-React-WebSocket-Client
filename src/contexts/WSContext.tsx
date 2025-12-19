import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface WSContextType {
    messages: unknown[];
    addMessage: (msg: unknown) => void;
}

const WSContext = createContext<WSContextType | undefined>(undefined);

export function WSProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<unknown[]>([]);

    const addMessage = (msg: unknown) => {
        setMessages(prev => [...prev, msg]);
    };

    return (
        <WSContext.Provider value={{ messages, addMessage }}>
            {children}
        </WSContext.Provider>
    );
}

export function useWS() {
    const context = useContext(WSContext);
    if (context === undefined) {
        throw new Error('useWS must be used within a WSProvider');
    }
    return context;
}