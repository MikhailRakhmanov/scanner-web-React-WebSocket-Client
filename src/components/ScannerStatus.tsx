
import './styles/ScannerStatus.css';

type Props = {
    scannerStatus: 'connected' | 'refused' | 'unknown';
    url: string;
    onReconnect?: () => void;
};

export function ScannerStatus({ scannerStatus, url, onReconnect }: Props) {
    const isConnected = scannerStatus === 'connected';

    return (
        <div className="scanner-status-container" title={url}>
            <span className={`status-dot ${isConnected ? 'connected' : 'refused'}`} />
            <span className={`scanner-status-text ${scannerStatus}`}>
                {scannerStatus === 'connected' ? 'Сканнер подключен' :
                    scannerStatus === 'refused' ? 'Сканнер отключен' :
                        'Поиск сканнера...'}
            </span>

            {scannerStatus === 'refused' && (
                <button
                    className="btn reconnect-btn"
                    onClick={onReconnect}
                >
                    Повторить
                </button>
            )}
        </div>
    );
}

export default ScannerStatus;
