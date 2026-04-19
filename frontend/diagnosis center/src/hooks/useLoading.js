import { useState } from 'react'

export default function useLoading() {
  const [isLoading, setIsLoading] = useState(false)

  async function withLoading(asyncFn) {
    setIsLoading(true)
    try {
      return await asyncFn()
    } finally {
      setIsLoading(false)
    }
  }

  return [isLoading, withLoading]
}
