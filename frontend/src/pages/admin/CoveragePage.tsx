import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import type { Config } from '../../types'
import { API } from '../../lib/api'
import LocationPicker, { type LatLng } from '../../components/LocationPicker'
import { Check, Crosshair } from 'lucide-react'

export default function CoveragePage() {
  const { token } = useAuth()
  const [radius, setRadius] = useState(2)
  const [store, setStore] = useState<LatLng | null>(null)
  const [saved, setSaved] = useState(false)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    fetch(`${API}/config`)
      .then(r => r.json())
      .then((c: Config) => {
        setRadius(c.coverageRadius)
        // Si aún no se ha configurado (0,0), dejar el mapa sin marcador
        if (c.storeLat !== 0 || c.storeLng !== 0) {
          setStore({ lat: c.storeLat, lng: c.storeLng })
        }
      })
  }, [])

  const handleSave = async () => {
    if (!store) return
    await fetch(`${API}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ coverageRadius: radius, storeLat: store.lat, storeLng: store.lng }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => { setStore({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false) },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 className="adm-title">Cobertura de domicilios</h1>

      <div className="adm-card">
        <h2 className="adm-card-title">Ubicación de la tienda</h2>
        <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 14 }}>
          Haz clic en el mapa para marcar dónde está tu tienda. El círculo verde muestra hasta dónde
          llegan tus domicilios según el radio que elijas.
        </p>

        <button type="button" onClick={useMyLocation} disabled={locating} className="adm-btn-ghost"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <Crosshair size={16} /> {locating ? 'Ubicando...' : 'Usar mi ubicación actual'}
        </button>

        <div style={{ borderRadius: 'var(--rounded-md)', overflow: 'hidden', border: 'var(--border-level-1)' }}>
          <LocationPicker
            value={store}
            onChange={setStore}
            storeLat={store?.lat ?? 0}
            storeLng={store?.lng ?? 0}
            coverageRadius={radius}
          />
        </div>

        {!store && (
          <p style={{ fontSize: 13, color: '#b26a00', marginTop: 10 }}>
            Aún no has marcado la ubicación de la tienda. Toca el mapa para ubicarla.
          </p>
        )}

        {/* Radio de cobertura */}
        <div style={{ marginTop: 18 }}>
          <label className="adm-label">Radio de cobertura: <strong>{radius} km</strong></label>
          <input
            type="range" min={0.5} max={10} step={0.5} value={radius}
            onChange={e => setRadius(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--on-surface-variant)' }}>
            <span>0.5 km</span><span>10 km</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
          <button onClick={handleSave} className="adm-btn" disabled={!store}>Guardar</button>
          {saved && (
            <span style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Check size={16} /> Guardado
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
