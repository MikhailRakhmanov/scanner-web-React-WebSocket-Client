import { useCallback, useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import ConnectionStatus from '../components/ConnectionStatus'
import PairList from '../components/PairList'

import { useWebSocket } from '../hooks/useWebSocket'
import { api } from '../services/api'
import type { PlatformId, PlatformMap, ProductScan, WSMessage } from '../types'

const LS_KEY_PRODUCTS = 'scanner_products'
const LS_KEY_PLATFORM = 'scanner_selected_platform'
const PAIRS_TTL_MS = 10 * 60 * 1000

export default function Dashboard() {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | null>(null)
  const [products, setProducts] = useState<ProductScan[]>([])

  const handleWS = useCallback((msg: WSMessage) => {
    const type = (msg as any).type || undefined

    if ((msg as any).data?.platform !== undefined && (msg as any).data?.product !== undefined && type !== 'change_platform') {
      const { platform, product, scanId } = (msg as any).data as { platform: PlatformId; product: number; scanId?: number }
      if (selectedPlatform === null) {
        setSelectedPlatform(platform)
      }
      if (selectedPlatform !== null && platform === selectedPlatform) {
        setProducts(prev => [{ product, scanId: scanId ?? (prev[0]?.scanId ?? 0) + 1 }, ...prev])
      }
      return
    }

    if ((msg as any).data?.platform !== undefined && (msg as any).data?.pairs) {
      const { platform, pairs } = (msg as any).data as { platform: PlatformId; pairs: PlatformMap }
      setSelectedPlatform(platform)
      const list = (pairs[platform] || [])
      setProducts(list)
      return
    }

    if (type === 'new_pair' && (msg as any).data) {
      const { platform, product, scanId } = (msg as any).data as { platform: PlatformId; product: number; scanId?: number }
      if (selectedPlatform !== null && platform === selectedPlatform) {
        setProducts(prev => [{ product, scanId: scanId ?? (prev[0]?.scanId ?? 0) + 1 }, ...prev])
      }
      return
    }

    if (type === 'change_platform' && (msg as any).data?.pairs) {
      const { platform, pairs } = (msg as any).data as { platform: PlatformId; pairs: PlatformMap }
      setSelectedPlatform(platform)
      const list = (pairs[platform] || [])
      setProducts(list)
      return
    }
  }, [selectedPlatform])

  const { isConnected, url, reconnect } = useWebSocket({ onMessage: handleWS })

  useEffect(() => {
    try {
      const storedPlatform = localStorage.getItem(LS_KEY_PLATFORM)
      const storedProducts = localStorage.getItem(LS_KEY_PRODUCTS)

      if (storedPlatform !== null) {
        const platformValue = Number(storedPlatform)
        if (!Number.isNaN(platformValue)) {
          setSelectedPlatform(platformValue as PlatformId)
        }
      }

      if (storedProducts) {
        const parsed = JSON.parse(storedProducts) as { products: ProductScan[]; ts: number }
        const now = Date.now()
        if (parsed && Array.isArray(parsed.products) && typeof parsed.ts === 'number') {
          if (now - parsed.ts <= PAIRS_TTL_MS) {
            setProducts(parsed.products)
          } else {
            localStorage.removeItem(LS_KEY_PRODUCTS)
          }
        }
      }
    } catch (e) {
      console.error('Ошибка чтения пар из localStorage', e)
    }
  }, [])

  useEffect(() => {
    try {
      if (selectedPlatform !== null) {
        localStorage.setItem(LS_KEY_PLATFORM, String(selectedPlatform))
      }
      const payload = { products, ts: Date.now() }
      localStorage.setItem(LS_KEY_PRODUCTS, JSON.stringify(payload))
    } catch (e) {
      console.error('Ошибка сохранения пар в localStorage', e)
    }
  }, [products, selectedPlatform])

  const loadPairs = useCallback(async () => {
    try {
      if (selectedPlatform === null) return
      const params: { date: string; platform?: number } = { date: new Date().toISOString().slice(0,10), platform: selectedPlatform }
      const data = await api.getPairs(params)
      const list = (data as PlatformMap)[selectedPlatform] || []
      setProducts(list)
    } catch (e) {
      console.error('Ошибка загрузки пар', e)
    }
  }, [selectedPlatform])

  useEffect(() => {
    if (selectedPlatform !== null) {
      void loadPairs()
    }
  }, [selectedPlatform, loadPairs])

  useEffect(() => {
    void loadPairs()
  }, [loadPairs])

  const handleClearProducts = () => {
    setProducts([])
    try {
      localStorage.removeItem(LS_KEY_PRODUCTS)
    } catch (e) {
      console.error('Ошибка очистки пар в localStorage', e)
    }
  }

  return (
    <div className="page">
      <Header title="Сканер пар — мониторинг"/>
      <ConnectionStatus connected={isConnected} url={url} onReconnect={reconnect} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="btn" onClick={handleClearProducts}>Сбросить данные</button>
      </div>
      {/*<ScannerInfo total={scannersTotal} items={scannerItems} onRefresh={loadScanners} />*/}
      <PairList platform={selectedPlatform} products={products} />
    </div>
  )
}
