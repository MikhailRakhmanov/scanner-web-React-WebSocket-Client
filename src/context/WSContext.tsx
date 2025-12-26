import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { api } from "../services/api.ts";

interface WSContextType {
    messages: unknown[];
    addMessage: (msg: unknown) => void;
    hasScannerConnection: boolean;
    historyToday: any[];
    isLoadingHistory: boolean;
}

const WSContext = createContext<WSContextType | undefined>(undefined);

interface RegisterSuccessMessage {
    event: "register_success";
    current_platform: number;
    input_count: number;
}

function isRegisterSuccess(msg: any): msg is RegisterSuccessMessage {
    return (
        typeof msg === 'object' &&
        msg !== null &&
        msg.event === "register_success" &&
        typeof msg.current_platform === 'number'
    );
}

export function WSProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<unknown[]>([]);
    const [hasScannerConnection, setHasScannerConnection] = useState(false);
    const [historyToday, setHistoryToday] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const fetchTodayHistory = useCallback(async (platformId: number) => {
        setIsLoadingHistory(true);
        try {
            const today = new Date().toLocaleDateString('en-CA');
            const response = await api.getHistory({
                date_from: today,
                date_to: today,
                platform: platformId,
                size: 100,
                sort: 'timestamp,desc'
            });
            setHistoryToday(response.items || []);
        } catch (error) {
            console.error("Ошибка загрузки истории:", error);
            setHistoryToday([]);
        } finally {
            setIsLoadingHistory(false);
        }
    }, []);

    const addMessage = useCallback((msg: any) => {
        // Очистка при переподключении (событие от хука useWebSocket)
        if (msg.event === 'register_start') {
            setHistoryToday([]);
        }

        setMessages(prev => [...prev, msg]);

        // ПРОВЕРКА 1: Успешная регистрация (при входе в приложение)
        if (isRegisterSuccess(msg)) {
            setHasScannerConnection(msg.input_count > 0);
            fetchTodayHistory(msg.current_platform);
        }

        // ПРОВЕРКА 2: Смена платформы (когда сканнер пикнул новую платформу)
        // Внутри addMessage в WSProvider.tsx
        if (msg.event === 'change_platform') {
            const platformId = msg.platform || msg.current_platform;
            if (platformId) {
                // Мы НЕ очищаем массив здесь, чтобы Dashboard мог показать "Загрузка..."
                // поверх старых данных или просто плавно их заменить.
                fetchTodayHistory(platformId);
            }
        }
    }, [fetchTodayHistory]);

    return (
        <WSContext.Provider value={{
            messages,
            addMessage,
            hasScannerConnection,
            historyToday,
            isLoadingHistory
        }}>
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
