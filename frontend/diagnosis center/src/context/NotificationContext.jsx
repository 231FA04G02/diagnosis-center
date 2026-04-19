import { createContext, useContext, useEffect } from 'react'
import { useAuth } from './AuthContext'
import client from '../api/client'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user, token } = useAuth()

  useEffect(() => {
    if (!user || !token) return

    // Stub: log FCM token registration (real Firebase config needs credentials)
    async function registerFCMToken() {
      try {
        // In production, get the actual FCM token from Firebase SDK
        const fcmToken = 'stub-fcm-token'
        console.log('[NotificationContext] Registering FCM token for user:', user.id || user._id)
        await client.post('/notifications/token', { token: fcmToken })
      } catch (err) {
        console.log('[NotificationContext] FCM token registration skipped (stub):', err.message)
      }
    }

    registerFCMToken()
  }, [user, token])

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  return useContext(NotificationContext)
}
