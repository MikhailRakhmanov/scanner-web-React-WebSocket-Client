import { useState, useEffect } from 'react';

type Props = {
    product: number;
    scanId: string | number;
    isLatest: boolean;
    timestamp?: number; // Добавляем пропс времени
};

export default function ProductChip({ product, scanId, isLatest, timestamp }: Props) {
    const [isRecent, setIsRecent] = useState(false);

    useEffect(() => {
        // Проверка: продукт "живой" (3 секунды)
        const isLive = timestamp && (Date.now() - timestamp < 3000);

        if (isLive) {
            setIsRecent(true);
            const timer = setTimeout(() => setIsRecent(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [scanId]);

    return (
        <span className={`product-chip 
            ${isRecent ? 'recent-scan' : ''} 
            ${isLatest && isRecent ? 'last-scanned-peak' : ''} 
        `}>
            {product}
        </span>
    );
}
