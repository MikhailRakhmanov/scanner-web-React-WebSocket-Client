import { useCallback, useEffect, useState } from 'react'
import Header from '../components/Header'
import { api } from '../services/api'
import type { PlatformId, PlatformMap, ProductScan } from '../types'

export default function History() {
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10))
  const [data, setData] = useState<PlatformMap>({} as PlatformMap)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.getPairs({ date })
      setData(res)
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => { void load() }, [load])

  const platforms = Object.keys(data).map(k => Number(k) as PlatformId)

  return (
    <div className="page">
      <Header title="История пар" right={null} />

      <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <label>
          <span style={{ marginRight: 8, color: 'var(--muted)' }}>Дата:</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <button className="btn" onClick={load} disabled={loading}>Загрузить</button>
        {loading && <span className="status-text">Загрузка...</span>}
        {error && <span style={{ color: 'var(--danger)' }}>{error}</span>}
      </div>

      <div className="grid">
        {platforms.length === 0 && (
          <div className="card">Нет данных за выбранную дату</div>
        )}
        {platforms.map((pid) => {
          const prods = (data[pid] || []) as ProductScan[]
          return (
            <div className="card" key={pid}>
              <div className="card-header">
                <div className="card-title">Платформа №{pid}</div>
                <div className="card-badge">{prods.length} шт.</div>
              </div>
              <div className="products">
                {prods.map(p => (
                  <span key={p.scanId} className="chip">{p.product}</span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
