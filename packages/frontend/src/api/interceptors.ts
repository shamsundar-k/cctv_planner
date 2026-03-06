import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import client from './client'
import { useAuthStore } from '../store/authSlice'

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// Attach access token to every outgoing request
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401: try one silent refresh, then retry the original request
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableRequest | undefined

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true

      const { refreshToken, setAccessToken, clearAuth } = useAuthStore.getState()

      if (!refreshToken) {
        clearAuth()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await client.post<{ access_token: string }>(
          '/auth/refresh',
          { refresh_token: refreshToken },
        )
        setAccessToken(data.access_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return client(original)
      } catch {
        clearAuth()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

export default client
