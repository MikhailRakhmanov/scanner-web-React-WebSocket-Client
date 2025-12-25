import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface WSContextType {
    messages: unknown[];
    addMessage: (msg: unknown) => void;
    hasScannerConnection: boolean; // Добавлено состояние
}

const WSContext = createContext<WSContextType | undefined>(undefined);

// Функция-предикат для проверки наличия input_connection в неизвестном объекте
function isRegisterMessage(msg: any): msg is { input_count: number } {
    return typeof msg === 'object' && msg !== null && 'input_count' in msg;
}

export function WSProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<unknown[]>([]);
    const [hasScannerConnection, setHasScannerConnection] = useState(false);

    const addMessage = useCallback((msg: unknown) => {
        setMessages(prev => [...prev, msg]);

        // Если пришло сообщение с input_count (как в вашем примере)
        if (isRegisterMessage(msg)) {
            setHasScannerConnection(msg.input_count > 0);
        }
    }, []);

    return (
        <WSContext.Provider value={{ messages, addMessage, hasScannerConnection }}>
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
