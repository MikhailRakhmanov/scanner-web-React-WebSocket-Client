import React from 'react';

type Props = {
    scannerStatus: 'connected' | 'refused' | 'unknown';
    url: string;
    onReconnect?: () => void;
};

export function ScannerStatus({ scannerStatus, url, onReconnect }: Props) {
    const isConnected = scannerStatus === 'connected';

    return (
        <div className="status" title={url} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
            <span className={`status-dot ${isConnected ? 'connected' : 'refused'}`} />
            <span className="status-text" style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>
                {scannerStatus === 'connected' ? 'Сканнер подключен' :
                    scannerStatus === 'refused' ? 'Сканнер отключен' :
                        'Поиск сканнера...'}
            </span>

            {/* Показываем кнопку только если нет связи с сервером (refused) */}
            {scannerStatus === 'refused' && (
                <button
                    className="btn"
                    onClick={onReconnect}
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                    Повторить
                </button>
            )}
        </div>
    );
}

export default ScannerStatus;
