import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { HistoryResponse } from "../types";
import { api } from "../services/api";
import './styles/HistoryPage.css'; // Импорт локальных стилей

type SortField = 'id' | 'login' | 'platform' | 'product' | 'timestamp' | 'legacy_synced' | 'legacy_integration_error';

interface Filters {
    date_from?: string;
    date_to?: string;
    platform?: number;
    product?: number;
    login?: string;
    legacy_synced?: number;
    is_overwrite?: boolean;
    sort: SortField;
    order: 'asc' | 'desc';
    page: number;
    size: number;
}

const HistoryPage: React.FC = () => {
    const [history, setHistory] = useState<HistoryResponse>({
        items: [], total: 0, page: 1, size: 100, pages: 0
    });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<Filters>({
        page: 1, size: 100, date_from: '', date_to: '', login: '',
        platform: undefined, product: undefined, legacy_synced: undefined,
        is_overwrite: undefined, sort: 'timestamp', order: 'desc'
    });
    const [showFilters, setShowFilters] = useState(false);

    const filtersRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);

    // Закрытие фильтров при клике вне области
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (filtersRef.current && !filtersRef.current.contains(target) &&
                buttonRef.current && !buttonRef.current.contains(target)) {
                setShowFilters(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Установка даты по умолчанию
    useEffect(() => {
        setFilters(prev => ({ ...prev, date_from: today, date_to: today }));
    }, [today]);

    const loadHistory = useCallback(async (currentFilters: Filters) => {
        setLoading(true);
        try {
            const data = await api.getHistory(currentFilters);
            setHistory(data);
        } catch (error) {
            console.error('Ошибка загрузки истории:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHistory(filters);
    }, [filters, loadHistory]);

    const handleSort = (field: SortField) => {
        setFilters(prev => ({
            ...prev,
            sort: field,
            order: prev.sort === field && prev.order === 'asc' ? 'desc' : 'asc',
            page: 1
        }));
    };

    const updateFilter = (key: keyof Filters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === '' ? undefined : value,
            page: 1
        }));
    };

    const resetFilters = () => {
        setFilters({
            date_from: today, date_to: today, page: 1, size: 100,
            sort: 'timestamp', order: 'desc', login: '',
            platform: undefined, product: undefined,
            legacy_synced: undefined, is_overwrite: undefined
        });
    };

    const getStatusBadge = (status: number | null) => {
        const badges = {
            1: <span className="status-badge status-success">✅ Синхр.</span>,
            0: <span className="status-badge status-warning">⏳ Ожидает</span>,
            [-1]: <span className="status-badge status-error">❌ Ошибка</span>
        };
        return badges[status as keyof typeof badges] || <span className="status-badge">—</span>;
    };

    const columns: { key: SortField; label: string }[] = [
        { key: 'id', label: 'ID' },
        { key: 'login', label: 'Логин' },
        { key: 'platform', label: 'Платформа' },
        { key: 'product', label: 'Продукт' },
        { key: 'legacy_synced', label: 'Статус' },
        { key: 'timestamp', label: 'Время' }
    ];

    return (
        <div className="history-container">
            <div className="history-header">
                <h1 className="history-title">История сканирований</h1>
                <div className="history-stats">
                    Всего: <strong>{history.total.toLocaleString()}</strong>
                </div>
            </div>

            <div className="history-controls">
                <button
                    ref={buttonRef}
                    className="history-btn"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    {showFilters ? 'Скрыть фильтры' : '🔧 Фильтры'}
                </button>
                <div className="history-size-selector">
                    {[50, 100, 200].map(s => (
                        <button
                            key={s}
                            className={`history-btn ${filters.size === s ? 'active' : ''}`}
                            onClick={() => updateFilter('size', s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {showFilters && (
                <div ref={filtersRef} className="filters-panel">
                    <div className="filters-grid">
                        <div className="filter-group">
                            <label>От</label>
                            <input type="date" className="history-input" value={filters.date_from} onChange={e => updateFilter('date_from', e.target.value)} />
                        </div>
                        <div className="filter-group">
                            <label>До</label>
                            <input type="date" className="history-input" value={filters.date_to} onChange={e => updateFilter('date_to', e.target.value)} />
                        </div>
                        <div className="filter-group">
                            <label>Логин</label>
                            <input type="text" className="history-input" placeholder="user123" value={filters.login} onChange={e => updateFilter('login', e.target.value)} />
                        </div>
                        <div className="filter-group">
                            <label>Платформа ID</label>
                            <input type="number" className="history-input" placeholder="ID" value={filters.platform || ''} onChange={e => updateFilter('platform', Number(e.target.value) || undefined)} />
                        </div>
                        <div className="filter-group">
                            <label>Статус</label>
                            <select className="history-select" value={filters.legacy_synced ?? ''} onChange={e => updateFilter('legacy_synced', e.target.value === '' ? undefined : Number(e.target.value))}>
                                <option value="">Все</option>
                                <option value="1">✅ Синхронизировано</option>
                                <option value="0">⏳ Ожидает</option>
                                <option value="-1">❌ Ошибка</option>
                            </select>
                        </div>
                        <div className="filter-group checkbox-group">
                            <label className="checkbox-label">
                                <input type="checkbox" checked={filters.is_overwrite || false} onChange={e => updateFilter('is_overwrite', e.target.checked)} />
                                <span>Перезапись</span>
                            </label>
                        </div>
                    </div>
                    <div className="filter-actions">
                        <button className="history-btn" onClick={resetFilters}>🔄 Сбросить все фильтры</button>
                    </div>
                </div>
            )}

            <div className="history-table-container">
                <table className="history-table">
                    <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} className="history-th sortable" onClick={() => handleSort(col.key)}>
                                <div className="th-content">
                                    {col.label}
                                    <span className="sort-icon">
                                            {filters.sort === col.key ? (filters.order === 'asc' ? '🔼' : '🔽') : '↕️'}
                                        </span>
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="loading-state">
                                <div className="spinner"></div>
                                <span>Загрузка данных...</span>
                            </td>
                        </tr>
                    ) : history.items.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="empty-state">Нет записей по выбранным фильтрам</td>
                        </tr>
                    ) : (
                        history.items.map(item => (
                            <tr key={item.id}>
                                <td className="history-td font-mono">#{item.id}</td>
                                <td className="history-td font-semibold">{item.login}</td>
                                <td className="history-td">
                                    <span className="platform-badge">{item.platform}</span>
                                </td>
                                <td className="history-td font-mono">{item.product ?? '—'}</td>
                                <td className="history-td">{getStatusBadge(item.legacy_synced)}</td>
                                <td className="history-td time-cell">
                                    {new Date(item.timestamp).toLocaleString('ru-RU')}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {history.pages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        disabled={filters.page === 1}
                        onClick={() => updateFilter('page', filters.page - 1)}
                    >
                        ← Назад
                    </button>
                    <span className="pagination-info">
                        Стр. {filters.page} из {history.pages}
                    </span>
                    <button
                        className="pagination-btn"
                        disabled={filters.page === history.pages}
                        onClick={() => updateFilter('page', filters.page + 1)}
                    >
                        Вперед →
                    </button>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
