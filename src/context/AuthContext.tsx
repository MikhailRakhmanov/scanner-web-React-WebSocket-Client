import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth } from '../services/auth';

interface AuthContextType {
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
    login: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = auth.getToken();
        const login = auth.getLogin();
        if (token && login) {
            console.log('✅ AuthContext: Auto-auth success:', login);
            setIsAuthenticated(true);
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            setIsAuthenticated,
            login: auth.getLogin()
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// ✅ ЭКСПОРТ useAuth — ОБЯЗАТЕЛЬНО!
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
