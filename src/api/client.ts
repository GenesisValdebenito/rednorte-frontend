import axios from 'axios'

// En dev usa el proxy de Vite (/api → localhost:8080/api)
// En prod Docker usa nginx proxy
const BASE = import.meta.env.VITE_BFF_URL ?? '/api'

export const client = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

// Interceptor: inyecta token JWT en cada request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: muestra el error en consola con detalle
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message ?? err.message
    console.error(`[API Error] ${err.config?.method?.toUpperCase()} ${err.config?.url} → ${msg}`)
    return Promise.reject(err)
  }
)
