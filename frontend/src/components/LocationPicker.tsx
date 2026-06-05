import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'

// Pin personalizado (SVG) para no depender de las imágenes externas de Leaflet
// que a veces no cargan y mostraban un icono roto con el texto "Marker".
const pinIcon = L.divIcon({
  className: '',
  html: `
    <svg width="34" height="34" viewBox="0 0 24 24" fill="#006e0a" stroke="#fff" stroke-width="1.5"
      style="filter: drop-shadow(0 3px 4px rgba(0,0,0,0.3));">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5" fill="#fff" stroke="none"/>
    </svg>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
})

export interface LatLng {
  lat: number
  lng: number
}

interface Props {
  /** Ubicación seleccionada por el cliente */
  value: LatLng | null
  onChange?: (pos: LatLng) => void
  /** Centro de la tienda y radio de cobertura (km) */
  storeLat: number
  storeLng: number
  coverageRadius: number
  /** Si es true, el mapa es solo de visualización (no se puede hacer clic) */
  readOnly?: boolean
}

function ClickHandler({ onChange }: { onChange: (pos: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

// Recentrar el mapa cuando cambia la ubicación seleccionada (p.ej. geolocalización).
function Recenter({ value }: { value: LatLng | null }) {
  const map = useMap()
  if (value) map.setView([value.lat, value.lng])
  return null
}

export default function LocationPicker({ value, onChange, storeLat, storeLng, coverageRadius, readOnly }: Props) {
  const center: [number, number] = value
    ? [value.lat, value.lng]
    : storeLat || storeLng
    ? [storeLat, storeLng]
    : [4.4389, -75.2322] // Ibagué por defecto

  return (
    <MapContainer center={center} zoom={14} style={{ height: 'clamp(220px, 40vw, 300px)', width: '100%', borderRadius: 16 }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {!readOnly && onChange && <ClickHandler onChange={onChange} />}
      <Recenter value={value} />

      {/* Círculo de cobertura alrededor de la tienda */}
      {(storeLat || storeLng) && (
        <Circle
          center={[storeLat, storeLng]}
          radius={coverageRadius * 1000}
          pathOptions={{ color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.08 }}
        />
      )}

      {/* Marcador de la ubicación elegida */}
      {value && <Marker position={[value.lat, value.lng]} icon={pinIcon} />}
    </MapContainer>
  )
}
