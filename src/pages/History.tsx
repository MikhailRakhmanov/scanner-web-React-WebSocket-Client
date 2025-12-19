import { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import { api } from '../services/api'; // Предполагаю, что api.get с params и token
import DatePicker from 'react-datepicker'; // Для календаря
import 'react-datepicker/dist/react-datepicker.css'; // Стили
import ru from 'date-fns/locale/ru'; // Русский для даты

export default function History() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [items, setItems] = useState<any[]>([]);

    // Новое: состояние для фильтров
    const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Текущая дата по умолчанию
    const [selectedPlatform, setSelectedPlatform] = useState<number | null>(null);
    const platforms = [1, 2, 3, 4, 5]; // Замените на реальные ID платформ (можно загрузить динамически)

    const load = useCallback(async (date?: string, platform?: number) => {
        try {
            setLoading(true);
            setError(null);
            // Параметры для запроса
            const params: any = {};
            if (date) params.date = date;
            if (platform) params.platform = platform;

            const res = await api.get('/history', { params }); // REST с params
            setTotal(res.data.total || 0);
            setItems(res.data.items || []);
        } catch (e: any) {
            setError(e?.message || 'Ошибка загрузки истории');
        } finally {
            setLoading(false);
        }
    }, []);

    // Загрузка при монтировании (текущая дата)
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        setSelectedDate(new Date(today));
        void load(today);
    }, [load]);

    // Обработчик фильтра
    const handleFilter = useCallback(() => {
        if (selectedDate) {
            const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
            void load(dateStr, selectedPlatform);
        }
    }, [load, selectedDate, selectedPlatform]);

    // Enter на input для фильтра
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleFilter();
    };

    return (
        <div className="page">
            <Header title="История пиков продуктов" />

            {/* Фильтры: Календарь + Платформа */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header">
                    <div className="card-title">Фильтры</div>
                </div>
                <div style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                        <label style={{ marginRight: 8 }}>Дата:</label>
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date: Date) => setSelectedDate(date)}
                            dateFormat="dd.MM.yyyy"
                            locale={ru}
                            placeholderText="Выберите дату"
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <div>
                        <label style={{ marginRight: 8 }}>Платформа:</label>
                        <select
                            value={selectedPlatform || ''}
                            onChange={(e) => setSelectedPlatform(e.target.value ? parseInt(e.target.value) : null)}
                            onKeyDown={handleKeyDown}
                            style={{ padding: '4px 8px' }}
                        >
                            <option value="">Все</option>
                            {platforms.map(p => (
                                <option key={p} value={p}>Платформа {p}</option>
                            ))}
                        </select>
                    </div>
                    <button className="btn" onClick={handleFilter} disabled={!selectedDate || loading}>
                        Фильтровать
                    </button>
                    <button className="btn" onClick={() => load()} disabled={loading} style={{ marginLeft: 8 }}>
                        Обновить (все)
                    </button>
                </div>
            </div>

            {/* Карточка с тоталом */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Всего записей за день</div>
                    <div className="card-badge">{total}</div>
                    {selectedDate && (
                        <div style={{ fontSize: '14px', marginTop: 4, color: 'var(--text-secondary)' }}>
                            {selectedDate.toLocaleDateString('ru-RU')} {selectedPlatform ? `— Платформа ${selectedPlatform}` : ''}
                        </div>
                    )}
                </div>
                <div className="footer" style={{ marginTop: 8 }}>
                    {loading && <span className="status-text">Загрузка...</span>}
                    {error && <span style={{ color: 'var(--danger)' }}>{error}</span>}
                </div>
            </div>

            {/* Список */}
            <div className="grid">
                {items.length === 0 && !loading && <div className="card">Нет данных за выбранный день</div>}
                {items.map((it, idx) => (
                    <div key={it.id || idx} className="card"> {/* key по id для стабильности */}
                        <div className="card-header">
                            <div className="card-title">Платформа {it.platform} — Продукт {it.product}</div>
                            {it.timestamp && <div className="card-badge">{new Date(it.timestamp).toLocaleDateString('ru-RU')}</div>}
                        </div>
                        <div className="footer">
                            <span className="status-text">ID: {it.id}</span>
                            {it.scan_date && <span style={{ marginLeft: 16 }}>Время: {new Date(it.timestamp).toLocaleTimeString('ru-RU')}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}