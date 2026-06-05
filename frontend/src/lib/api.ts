// URL base de la API. Configurable por variable de entorno en producción.
// En desarrollo usa el backend local por defecto.
export const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'
