import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import client from './client'
import { useAuthStore } from '../store/authSlice'

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function notifySubscribers(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
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

      // Another request is already refreshing — queue this one
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`
            resolve(client(original))
          })
        })
      }

      const { refreshToken, setTokens, clearAuth } = useAuthStore.getState()

      if (!refreshToken) {
        clearAuth()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      isRefreshing = true

      try {
        const { data } = await client.post<{ access_token: string; refresh_token: string }>(
          '/auth/refresh',
          { refresh_token: refreshToken },
        )
        setTokens(data.access_token, data.refresh_token)
        notifySubscribers(data.access_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return client(original)
      } catch {
        clearAuth()
        refreshSubscribers = []
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default client
