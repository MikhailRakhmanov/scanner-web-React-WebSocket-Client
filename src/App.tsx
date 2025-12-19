import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WSProvider, useWS } from './contexts/WSContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import History from './pages/History';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ConnectionStatus from './components/ConnectionStatus';
import { useWebSocket } from './hooks/useWebSocket';
import { auth } from './services/auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { login } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // По умолчанию закрыт везде
    const { addMessage } = useWS();
    const [isMobile, setIsMobile] = useState(false);

    // Проверка ширины экрана
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 769);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Опционально: auto-open на десктопе (раскомментируйте, если нужно)
    // useEffect(() => {
    //     if (!isMobile) setIsSidebarOpen(true);
    // }, [isMobile]);

    // Блокировка скролла на мобильных при открытом
    useEffect(() => {
        if (isSidebarOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isSidebarOpen, isMobile]);

    const globalOnMessage = useCallback((data: unknown) => {
        console.log('Global WS received:', data);
        addMessage(data);
    }, [addMessage]);

    const { isConnected, url, reconnect } = useWebSocket({ onMessage: globalOnMessage });

    const handleLogout = () => {
        auth.clear();
        window.location.href = '/';
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const toggleIcon = isSidebarOpen ? '×' : '☰';

    return (
        <div className="app"> {/* Добавлен flex-контейнер для всего */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div
                className={`sidebar-overlay ${isSidebarOpen && isMobile ? 'open' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />
            <div className="main-container"> {/* Flex для header + main */}
                <header className="header">
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                            {/* Toggle-кнопка всегда видна (для десктопа тоже) */}
                            <button className="toggle-btn" onClick={toggleSidebar}>
                                {toggleIcon}
                            </button>
                            <Header title={`Сканер пар — ${login || 'Гость'}`} />
                        </div>
                        <div className="flex items-center gap-4">
                            <ConnectionStatus connected={isConnected} url={url} onReconnect={reconnect} />
                            <button className="btn" onClick={handleLogout}>Выйти</button>
                        </div>
                    </div>
                </header>
                <main className={`main ${!isSidebarOpen ? 'with-sidebar-closed' : ''}`}>{children}</main>
            </div>
        </div>
    );
}

function AppContent() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return (
        <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/dashboard/*" element={
                <ProtectedRoute>
                    <ProtectedLayout>
                        <Routes>
                            <Route path="" element={<Dashboard />} />
                            <Route path="history" element={<History />} />
                            <Route path="devices" element={<Devices />} />
                        </Routes>
                    </ProtectedLayout>
                </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <WSProvider>
                <Router>
                    <AppContent />
                </Router>
            </WSProvider>
        </AuthProvider>
    );
}