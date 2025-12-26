import  { createContext, useContext, useState, type ReactNode } from 'react';

interface ScannerContextType {
    scannerStatus: 'connected' | 'refused' | 'unknown';
    updateScannerStatus: (status: 'connected' | 'refused' | 'unknown') => void;
}

const ScannerContext = createContext<ScannerContextType | undefined>(undefined);

export function ScannerProvider({ children }: { children: ReactNode }) {
    const [scannerStatus, setScannerStatus] = useState<'connected' | 'refused' | 'unknown'>('unknown');

    const updateScannerStatus = (status: 'connected' | 'refused' | 'unknown') => {
        setScannerStatus(status);
    };

    return (
        <ScannerContext.Provider value={{ scannerStatus, updateScannerStatus }}>
            {children}
        </ScannerContext.Provider>
    );
}

export function useScannerStatus() {
    const context = useContext(ScannerContext);
    if (context === undefined) {
        throw new Error('useScannerStatus must be used within a ScannerProvider');
    }
    return context;
}
