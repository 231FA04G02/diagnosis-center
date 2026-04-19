import { createContext, useContext, useState } from 'react'
import client from '../api/client'

export const AuthContext = createContext(null)

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token')
    return t ? decodeJWT(t) : null
  })

  async function login(email, password) {
    const { data } = await client.post('/auth/login', { email, password })
    const jwt = data.data.token
    localStorage.setItem('token', jwt)
    setToken(jwt)
    setUser(decodeJWT(jwt))
    return data
  }

  async function register(name, email, password, role) {
    const { data } = await client.post('/auth/register', { name, email, password, role })
    const jwt = data.data.token
    localStorage.setItem('token', jwt)
    setToken(jwt)
    setUser(decodeJWT(jwt))
    return data
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
