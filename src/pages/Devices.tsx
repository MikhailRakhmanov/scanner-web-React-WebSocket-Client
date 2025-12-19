import { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import { api } from '../services/api';

export default function Devices() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [items, setItems] = useState<any[]>([]);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.getScanners();
            setTotal(res.total_scanners);
            setItems(res.scanners);
        } catch (e: any) {
            setError(e?.message || 'Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <div className="page">
            <Header title="Устройства" />
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Всего устройств</div>
                    <div className="card-badge">{total}</div>
                </div>
                <div className="footer" style={{ marginTop: 8 }}>
                    <button className="btn" onClick={load} disabled={loading}>Обновить</button>
                    {loading && <span className="status-text">Загрузка...</span>}
                    {error && <span style={{ color: 'var(--danger)' }}>{error}</span>}
                </div>
            </div>
            <div className="grid">
                {items.length === 0 && !loading && <div className="card">Нет данных об устройствах</div>}
                {items.map((it, idx) => (
                    <div key={idx} className="card">
                        <div className="card-header">
                            <div className="card-title">{it.name || it.id || `Device #${idx + 1}`}</div>
                            {it.status && <div className="card-badge">{it.status}</div>}
                        </div>
                        <div className="footer">
                            <span className="status-text">{it.ip || it.address || '—'}</span>
                            {it.last_seen && <span className="status-text">Last: {new Date(it.last_seen).toLocaleString()}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}