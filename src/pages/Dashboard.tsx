import { useEffect, useState, useRef } from 'react';
import Header from '../components/Header';
import PairList from '../components/PairList';
import { useWS } from '../context/WSContext';
import type { PlatformId, ProductScan } from '../types';
import './styles/Dashboard.css';

export default function Dashboard() {
    const { messages, historyToday, isLoadingHistory } = useWS();
    const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | null>(null);
    const [products, setProducts] = useState<ProductScan[]>([]);
    const platformRef = useRef<PlatformId | null>(null);

    useEffect(() => {
        platformRef.current = selectedPlatform;
    }, [selectedPlatform]);

    // 1. СИНХРОНИЗАЦИЯ С API (История — без анимации)
    useEffect(() => {
        if (historyToday.length > 0) {
            const platformFromHistory = historyToday[0].platform as PlatformId;
            setSelectedPlatform(platformFromHistory);

            const mapped = historyToday.map(item => ({
                product: item.product,
                scanId: item.id,
                timestamp: 0 // Ставим 0, чтобы чипы знали, что это история
            }));

            setProducts(prev => {
                const historyIds = new Set(mapped.map(p => p.scanId));
                const wsOnly = prev.filter(p => !historyIds.has(p.scanId));
                return [...wsOnly, ...mapped];
            });
        }
    }, [historyToday]);

    // 2. ОБРАБОТКА WS СОБЫТИЙ (Мгновенная реакция — с анимацией)
    useEffect(() => {
        if (messages.length === 0) return;
        const latestMsg = messages[messages.length - 1] as any;
        const event = latestMsg.event || latestMsg.type;
        const payload = latestMsg.data || latestMsg;

        // А) Смена платформы
        if (event === 'change_platform') {
            const newPid = payload.platform || payload.current_platform;
            if (newPid) setSelectedPlatform(newPid as PlatformId);

            let rawItems = payload.items || payload.products;
            if (!rawItems && payload.pairs && newPid) {
                rawItems = payload.pairs[newPid] || payload.pairs[String(newPid)];
            }

            if (rawItems && Array.isArray(rawItems)) {
                setProducts(rawItems.map((p: any) => ({
                    product: p.product || p.id,
                    scanId: p.scan_id || p.scanId || p.id,
                    timestamp: 0 // Смена платформы обычно загружает пачку данных, не подсвечиваем всё
                })));
            }
            return;
        }

        // Б) Новый пик (Самый важный момент для анимации)
        if (event === 'new_product' || event === 'new_pair' || payload.product) {
            const msgPlatform = payload.platform || payload.current_platform;
            const currentP = platformRef.current;

            if (Number(msgPlatform) === Number(currentP) || currentP === null) {
                const rawProduct = payload.product;
                const productValue = typeof rawProduct === 'object' ? rawProduct.id : rawProduct;
                const scanId = payload.scan_id || payload.scanId || payload.id || Date.now();

                if (productValue) {
                    setProducts(prev => {
                        if (prev.some(p => p.scanId === scanId)) return prev;
                        // Добавляем текущее время для активации анимации в чипе
                        return [{
                            product: productValue,
                            scanId,
                            timestamp: Date.now()
                        }, ...prev];
                    });
                }
            }
        }
    }, [messages]);

    return (
        <div className="dashboard-page">
            <Header title="Мониторинг" />
            <div className="dashboard-status-info">
                {isLoadingHistory && <span className="sync-loader">🔄 Загрузка истории... </span>}
                {selectedPlatform ? (
                    <span className="platform-active-tag">Платформа №{selectedPlatform} — Активна</span>
                ) : (
                    <span>Ожидание сканера...</span>
                )}
            </div>
            <PairList platform={selectedPlatform} products={products} />
        </div>
    );
}
