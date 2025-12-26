import type { PlatformId, ProductScan } from '../types';
import ProductChip from './ProductChip';
import './styles/PairList.css';

type Props = {
    platform: PlatformId | null;
    products: ProductScan[];
};

export default function PairList({ platform, products }: Props) {
    // 1. Фильтруем только валидные продукты
    const validProducts = products.filter(p => Number(p.product) > 0);

    // 2. Находим ID самого последнего отсканированного продукта (он всегда первый в массиве)
    const latestScanId = validProducts.length > 0 ? validProducts[0].scanId : null;

    if (platform === null) {
        return <div className="card">Пока нет данных. Ожидаем события или обновление.</div>;
    }

    return (
        <div className="pair-grid">
            <div className="card" key={platform}>
                <div className="card-header">
                    <div className="card-title">Платформа №{platform}</div>
                    <div className="card-badge">{validProducts.length} шт.</div>
                </div>

                <div className="products-container">
                    {validProducts.map((p) => (
                        <ProductChip
                            key={p.scanId}
                            product={Number(p.product)}
                            scanId={p.scanId}
                            timestamp={p.timestamp}
                            // Проверка по ID гарантирует, что анимация будет только у ОДНОГО объекта
                            isLatest={p.scanId === latestScanId}
                        />
                    ))}

                    {validProducts.length === 0 && (
                        <div className="status-text">
                            Нет сканирований за сегодня. Пикните продукт!
                        </div>
                    )}
                </div>

                <div className="card-footer">
                    <span>Последнее обновление — {new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        </div>
    );
}
