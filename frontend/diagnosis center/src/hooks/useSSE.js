import { useEffect, useRef } from 'react'

const MAX_BACKOFF = 30000

export default function useSSE(url, onMessage) {
  const retryDelay = useRef(1000)
  const esRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (!url) return

    function connect() {
      const es = new EventSource(url)
      esRef.current = es

      es.onmessage = (event) => {
        retryDelay.current = 1000
        try {
          const data = JSON.parse(event.data)
          onMessage(data)
        } catch {
          onMessage(event.data)
        }
      }

      es.onerror = () => {
        es.close()
        timeoutRef.current = setTimeout(() => {
          retryDelay.current = Math.min(retryDelay.current * 2, MAX_BACKOFF)
          connect()
        }, retryDelay.current)
      }
    }

    connect()

    return () => {
      esRef.current?.close()
      clearTimeout(timeoutRef.current)
    }
  }, [url]) // eslint-disable-line react-hooks/exhaustive-deps
}
