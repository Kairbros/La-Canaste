import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ShoppingCart } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'DOMICILIARIO' ? '/repartidor' : '/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const loginInput: React.CSSProperties = {
    width: '100%', background: '#fff', border: '1.5px solid var(--outline-variant)',
    borderRadius: 'var(--rounded-md)', padding: '13px 15px', fontSize: 15, color: 'var(--on-surface)',
    transition: 'border-color 0.2s, box-shadow 0.2s', outline: 'none',
  }
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--primary)'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,110,10,0.12)'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--outline-variant)'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'linear-gradient(135deg, #e8f5e9 0%, #f0f3ff 55%, #ffffff 100%)' }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 'var(--rounded-xl)', boxShadow: '0 20px 60px rgba(0,0,0,0.10)', padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 20px rgba(0,110,10,0.30)' }}>
            <ShoppingCart size={30} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>La Canasta</h1>
          <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginTop: 4 }}>Acceso al panel</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label className="adm-label">Correo</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="tucorreo@ejemplo.com" style={loginInput} onFocus={onFocus} onBlur={onBlur}
            />
          </div>
          <div>
            <label className="adm-label">Contraseña</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••" style={loginInput} onFocus={onFocus} onBlur={onBlur}
            />
          </div>
          {error && (
            <p style={{ color: '#ba1a1a', background: '#ffeceb', borderRadius: 'var(--rounded-default)', padding: '10px 12px', fontSize: 14, textAlign: 'center', margin: 0 }}>
              {error}
            </p>
          )}
          <button
            type="submit" disabled={loading} className="adm-btn"
            style={{ width: '100%', padding: 15, fontSize: 15, marginTop: 4, boxShadow: '0 6px 16px rgba(0,110,10,0.25)' }}
          >
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
