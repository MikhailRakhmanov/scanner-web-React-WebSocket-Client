import './styles/ScannerInfo.css';

type Props = {
    total: number;
    items: any[];
    onRefresh?: () => void;
};

export default function ScannerInfo({total, items, onRefresh}: Props) {
    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">Сканеры</div>
                <div className="card-badge">{total}</div>
            </div>
            <div className="scanner-info-muted">
                Подключено сканеров: {total}
            </div>
            {items?.length > 0 && (
                <div className="scanner-list">
                    {items.map((s, i) => (
                        <div key={i} className="scanner-chip">
                            {typeof s === 'string' ? s : JSON.stringify(s)}
                        </div>
                    ))}
                </div>
            )}
            <div className="scanner-footer">
                <span>Обновляйте для актуального списка</span>
                <button className="btn" onClick={onRefresh}>Обновить</button>
            </div>
        </div>
    );
}
