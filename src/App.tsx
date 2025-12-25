import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WSProvider, useWS } from './context/WSContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import HistoryPage from './pages/HistoryPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ScannerStatus from "./components/ScannerStatus.tsx";
import { useWebSocket } from './hooks/useWebSocket';
import { auth } from './services/auth';

function ProtectedLayout() {
    // ✅ ВСЕ ХУКИ ПЕРЕД ЛЮБЫМИ ВОЗВРАТАМИ!
    const { isAuthenticated, login } = useAuth();
    const { addMessage, hasScannerConnection } = useWS();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ useCallback ДО возвратов!
    const globalOnMessage = useCallback((data: unknown) => {
        addMessage(data);
    }, [addMessage]);

    // ✅ useWebSocket ДО возвратов!
    const { isConnected, url, reconnect } = useWebSocket({ onMessage: globalOnMessage });

    // ✅ useEffect ДО возвратов!
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 769);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        const timer = setTimeout(() => setIsLoading(false), 200);
        return () => {
            window.removeEventListener('resize', checkMobile);
            clearTimeout(timer);
        };
    }, []);

    // ✅ ТЕПЕРЬ возвраты безопасны — все хуки уже вызваны!
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{background: 'var(--bg-primary)'}}>
                <div className="text-white text-xl animate-pulse">🔄 Инициализация...</div>
            </div>
        );
    }

    const currentScannerStatus = !isConnected ? 'refused' : hasScannerConnection ? 'connected' : 'unknown';

    return (
        <div className="app">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="main-container">
                <header className="header">
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                            <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                {isSidebarOpen ? '×' : '☰'}
                            </button>
                            <Header title={`Сканер пар — ${login}`} />
                            <ScannerStatus scannerStatus={currentScannerStatus} url={url} onReconnect={reconnect} />
                        </div>
                        <button className="btn" onClick={() => {
                            auth.clear();
                            window.location.href = '/';
                        }}>
                            Выйти
                        </button>
                    </div>
                </header>
                <main className={`main ${!isSidebarOpen ? 'with-sidebar-closed' : ''}`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

function LoginRedirect() {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />;
}

export default function App() {
    return (
        <AuthProvider>
            <WSProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<LoginRedirect />} />
                        <Route path="/dashboard" element={<ProtectedLayout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="history" element={<HistoryPage />} />
                            <Route path="devices" element={<Devices />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </Router>
            </WSProvider>
        </AuthProvider>
    );
}
