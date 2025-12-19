import type { PlatformId, ProductScan } from '../types';

type Props = {
    platform: PlatformId | null;
    products: ProductScan[];
};

export default function PairList({ platform, products }: Props) {
    // Фикс: фильтруем только реальные продукты (product > 0)
    const validProducts = products.filter(p => p.product > 0);

    if (platform === null) {
        return <div className="card">Пока нет данных. Ожидаем события или обновление.</div>;
    }

    return (
        <div className="grid">
            <div className="card" key={platform}>
                <div className="card-header">
                    <div className="card-title">Платформа №{platform}</div>
                    <div className="card-badge">{validProducts.length} шт.</div>
                </div>
                <div className="products">
                    {validProducts.map((p, index) => (
                        <span
                            key={p.scanId}
                            className={`chip ${index === 0 ? 'last-scanned' : ''}`} // Подсветка последнего
                        >
              {p.product}
            </span>
                    ))}
                    {validProducts.length === 0 && (
                        <div className="status-text" style={{ marginTop: 8, opacity: 0.7 }}>
                            Нет сканирований за сегодня. Пикните продукт!
                        </div>
                    )}
                </div>
                <div className="footer">
                    <span>Последнее обновление платформы — {new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        </div>
    );
}