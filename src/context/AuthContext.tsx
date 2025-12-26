import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth } from '../services/auth';

interface AuthContextType {
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
    login: string | null;
    isLoading: boolean; // Добавлено состояние загрузки
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Изначально true

    useEffect(() => {
        const token = auth.getToken();
        const login = auth.getLogin();

        if (token && login) {
            console.log('✅ AuthContext: Auto-auth success:', login);
            setIsAuthenticated(true);
        }

        // Завершаем загрузку после проверки токена
        setIsLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            setIsAuthenticated,
            login: auth.getLogin(),
            isLoading // Передаем в контекст
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
