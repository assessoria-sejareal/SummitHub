import axios from 'axios'

const baseURL = window.location.hostname.includes('railway.app')
  ? 'https://summithub-production.up.railway.app/api'
  : 'http://localhost:3001/api'

console.log('API baseURL:', baseURL)

const api = axios.create({
  baseURL,
  timeout: 30000 // 30 seconds timeout
})

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Add CSRF token only for POST requests and avoid infinite loops
  if (config.method === 'post' && !config.url?.includes('/csrf-token')) {
    try {
      const csrfResponse = await axios.get(
        window.location.hostname.includes('railway.app')
          ? 'https://summithub-production.up.railway.app/api/auth/csrf-token'
          : 'http://localhost:3001/api/auth/csrf-token'
      )
      config.headers['x-csrf-token'] = csrfResponse.data.csrfToken
    } catch (error) {
      console.error('Failed to get CSRF token:', error)
    }
  }
  
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token or redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Show user-friendly message
      if (window.location.pathname !== '/login') {
        alert('Sua sessão expirou. Faça login novamente.')
      }
      
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api