import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : undefined)

if (!baseURL) {
  // prevents silent "localhost" bugs after deployment
  throw new Error('VITE_API_URL is not set')
}

const api = axios.create({
  baseURL,
  timeout: 10000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      // optional: keep this if you want forced login on token expiry
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api