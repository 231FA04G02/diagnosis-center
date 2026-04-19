import { useState, useEffect } from 'react'
import client from '../api/client'
import useSSE from './useSSE'

export default function useQueue() {
  const [position, setPosition] = useState(null)
  const [estimatedWaitMinutes, setEstimatedWaitMinutes] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client
      .get('/queue/position')
      .then(({ data }) => {
        setPosition(data.data.position)
        setEstimatedWaitMinutes(data.data.estimatedWaitMinutes)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const sseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/queue/stream`

  useSSE(sseUrl, (data) => {
    if (data.position !== undefined) setPosition(data.position)
    if (data.estimatedWaitMinutes !== undefined) setEstimatedWaitMinutes(data.estimatedWaitMinutes)
  })

  return { position, estimatedWaitMinutes, loading }
}
