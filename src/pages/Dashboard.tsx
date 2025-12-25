import { useCallback, useEffect, useState, useRef } from 'react';
import Header from '../components/Header';
import PairList from '../components/PairList';
import { useWS } from '../context/WSContext';
import type { PlatformId, ProductScan } from '../types';

const LS_KEY_PRODUCTS = 'scanner_products';
const LS_KEY_PLATFORM = 'scanner_selected_platform';
const PAIRS_TTL_MS = 10 * 60 * 1000;

export default function Dashboard() {
    const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | null>(null);
    const [products, setProducts] = useState<ProductScan[]>([]);
    const [scannersCount, setScannersCount] = useState(0);
    const hasScannersConnectedRef = useRef(false);

    const { messages } = useWS();

    // handleWS на основе messages (реакт на новые)
    useEffect(() => {
        if (messages.length === 0) return;
        const latestMsg = messages[messages.length - 1];
        console.log('Latest WS msg:', latestMsg);

        try {
            const event = (latestMsg as any).event || (latestMsg as any).type;
            if (event === 'scanner_connected' && !hasScannersConnectedRef.current) {
                hasScannersConnectedRef.current = true;
                setScannersCount(1); // Только +1 на первое подключение
                return;
            }
            if (event === 'new_product' || event === 'new_pair') {
                const data = (latestMsg as any).data || latestMsg;
                const platform = data.platform || data.data?.platform;
                const productObj = data.product || data.data?.product;
                const product = typeof productObj === 'object' ? productObj.id : productObj;
                const scanId = data.scanId || Date.now();
                console.log('Parsed new_pair:', { platform, product, scanId });
                if (selectedPlatform === null) setSelectedPlatform(platform);
                if (selectedPlatform !== null && platform === selectedPlatform) {
                    setProducts((prev) => [{ product, scanId }, ...prev.slice(0, 9)]);
                }
                return;
            }
            if (event === 'change_platform') {
                const data = (latestMsg as any).data || latestMsg;
                const platform = data.platform;
                // Фикс: берём массив из data.pairs[platform] (PlatformMap)
                const pairsArray = data.pairs?.[platform] || data.products || [];
                setSelectedPlatform(platform);
                const list = Array.isArray(pairsArray) ? pairsArray : []; // Безопасная проверка
                setProducts(list.map((p: any) => ({ product: p.product || p.id, scanId: p.scanId || p.id })));
                console.log('Parsed change_platform:', { platform, productsCount: list.length });
                return;
            }
        } catch (e) {
            console.error('Ошибка обработки WS msg:', e, latestMsg); // Лог ошибки, но не вылет
        }
    }, [messages, selectedPlatform]);

    useEffect(() => {
        try {
            const storedPlatform = localStorage.getItem(LS_KEY_PLATFORM);
            if (storedPlatform !== null) {
                const platformValue = Number(storedPlatform);
                if (!Number.isNaN(platformValue)) setSelectedPlatform(platformValue as PlatformId);
            }
            const storedProducts = localStorage.getItem(LS_KEY_PRODUCTS);
            if (storedProducts) {
                const parsed = JSON.parse(storedProducts) as { products: ProductScan[]; ts: number };
                const now = Date.now();
                if (parsed && Array.isArray(parsed.products) && typeof parsed.ts === 'number' && now - parsed.ts <= PAIRS_TTL_MS) {
                    setProducts(parsed.products);
                } else {
                    localStorage.removeItem(LS_KEY_PRODUCTS);
                }
            }
        } catch (e) {
            console.error('Ошибка чтения из localStorage', e);
        }
    }, []);

    useEffect(() => {
        try {
            if (selectedPlatform !== null) localStorage.setItem(LS_KEY_PLATFORM, String(selectedPlatform));
            localStorage.setItem(LS_KEY_PRODUCTS, JSON.stringify({ products, ts: Date.now() }));
        } catch (e) {
            console.error('Ошибка сохранения в localStorage', e);
        }
    }, [products, selectedPlatform]);

    return (
        <div className="page">
            <Header title="Мониторинг" />
            {/* Простой статус сканнеров — мелко, под заголовком */}
            <div className="status-text" style={{ marginBottom: 12, fontSize: '0.9rem', opacity: 0.8 }}>
                Подключено сканнеров: {scannersCount || 1}
            </div>
            <PairList platform={selectedPlatform} products={products} />
        </div>
    );
}