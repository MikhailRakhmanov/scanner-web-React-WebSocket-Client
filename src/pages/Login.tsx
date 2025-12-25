import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { auth } from '../services/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [login, setLogin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // ✅ Правильный деструктурированный useAuth!
    const { isAuthenticated, setIsAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            const res = await api.login({ login });

            if (res.token) {
                // ✅ Правильная последовательность:
                auth.setToken(res.token);           // 1. Сохраняем токен
                auth.setLogin(res.login);           // 2. Сохраняем логин
                setIsAuthenticated(true);           // 3. Обновляем контекст
                navigate('/dashboard', { replace: true }); // 4. Редирект
            }
        } catch (err: any) {
            setError(err?.message || 'Ошибка авторизации');
        } finally {
            setLoading(false);
        }
    }

    // ✅ Если уже авторизован — НЕ рендерим форму
    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="app" style={{
            padding: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh'
        }}>
            <div className="card" style={{ maxWidth: 420, width: '100%' }}>
                <div className="card-header">
                    <div className="card-title">Вход в систему</div>
                </div>
                <form onSubmit={onSubmit} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    marginTop: 12
                }}>
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
                    {error && (
                        <div style={{ color: 'var(--accent-danger)', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
