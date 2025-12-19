import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { auth } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [login, setLogin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true }); // Редирект после авто-логина
        }
    }, [isAuthenticated, navigate]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            const res = await api.login({ login });
            if (res.token) {
                auth.setToken(res.token);
                auth.setLogin(res.login);
                useAuth().setIsAuthenticated(true); // Вызов setIsAuthenticated
                navigate('/dashboard', { replace: true });
            }
        } catch (err: any) {
            setError(err?.message || 'Ошибка авторизации');
        } finally {
            setLoading(false);
        }
    }

    if (isAuthenticated) {
        return null; // Не рендерим форму, если авторизован
    }

    return (
        <div className="app" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div className="card" style={{ maxWidth: 420, width: '100%' }}>
                <div className="card-header">
                    <div className="card-title">Вход в систему</div>
                </div>
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                    <label>
                        <div className="status-text" style={{ marginBottom: 6 }}>Логин</div>
                        <input
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            placeholder="Введите логин"
                            required
                            className="input"
                            disabled={loading}
                        />
                    </label>
                    <button className="btn" type="submit" disabled={loading}>
                        {loading ? 'Входим...' : 'Войти'}
                    </button>
                    {error && <div style={{ color: 'var(--accent-danger)' }}>{error}</div>}
                </form>
            </div>
        </div>
    );
}