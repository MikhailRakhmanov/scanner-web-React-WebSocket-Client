import type { PlatformMap, ScannerInfoResponse } from '../types';
import { auth } from './auth';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
            ...(auth.getToken() ? { Authorization: `Bearer ${auth.getToken()}` } : {}),
        },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
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
        const url = q.toString() ? `/api/scan/pairs?${q.toString()}` : '/api/scan/pairs';
        return request<PlatformMap>(url);
    },

    getScanners() {
        return request<ScannerInfoResponse>('/api/scanners');
    },

    getHistory(params?: { date_from?: string; date_to?: string }) {
        const q = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined && v !== null) q.append(k, String(v));
            });
        }
        const url = q.toString() ? `/api/scan/history?${q.toString()}` : '/api/scan/history';
        return request<any[]>(url);
    },
};