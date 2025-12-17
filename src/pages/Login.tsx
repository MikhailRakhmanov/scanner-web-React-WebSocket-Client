import { useState } from 'react'
import { api } from '../services/api'
import { auth } from '../services/auth'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [login, setLogin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      const res = await api.login({ login })
      if (res.access_token) {
        auth.setToken(res.access_token)
        navigate('/')
      }
    } catch (err: any) {
      setError(err?.message || 'Ошибка авторизации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app" style={{ maxWidth: 420 }}>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Вход в систему</div>
        </div>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <label>
            <div className="status-text" style={{ marginBottom: 6 }}>Логин</div>
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Введите логин"
              required
            />
          </label>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Входим...' : 'Войти'}
          </button>
          {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
        </form>
      </div>
    </div>
  )
}
