import type { PlatformMap, ScannerInfoResponse, HistoryResponse } from '../types';
import { auth } from './auth';

/**
 * Универсальный метод запроса.
 */
async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const token = auth.getToken();
    const res = await fetch(url, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.detail || `${res.status} ${res.statusText}`);
    }

    return res.json() as Promise<T>;
}

export const api = {
    login(payload: { login: string }) {
        return request<{ login: string; token: string; message?: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    getPairs(params?: { platform?: number; date?: string }) {
        const q = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined && v !== null) q.append(k, String(v));
            });
        }
        return request<PlatformMap>(`/api/scan/pairs?${q.toString()}`);
    },

    getScanners() {
        return request<ScannerInfoResponse>('/api/scanners');
    },
    getHistory(params?: {
        date_from?: string;
        date_to?: string;
        platform?: number;
        product?: number;
        login?: string;
        legacy_synced?: number;
        is_overwrite?: boolean;
        page?: number;
        size?: number;
        sort?: string;  // Теперь передаем сюда 'id', 'login' и т.д.
        order?: 'asc' | 'desc'; // Добавляем направление
    }): Promise<HistoryResponse> {
        const q = new URLSearchParams();

        if (params) {
            // 1. Обрабатываем сортировку отдельно, если есть оба параметра
            const { sort, order, ...rest } = params;

            if (sort && order) {
                q.append('sort', `${sort},${order}`); // Результат: sort=timestamp,desc
            } else if (sort) {
                q.append('sort', sort); // На случай, если порядок не передан
            }

            // 2. Добавляем остальные параметры
            Object.entries(rest).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') {
                    q.append(k, String(v));
                }
            });
        }

        const queryString = q.toString();
        const url = `/api/history${queryString ? `?${queryString}` : ''}`;
        return request<HistoryResponse>(url);
    },
};
