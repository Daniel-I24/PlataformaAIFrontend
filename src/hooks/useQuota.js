import { useState, useEffect, useCallback, useRef } from 'react'
import { getQuotaStatus, getUsageHistory } from '../api/aiApi'

/**
 * Gestiona el estado de cuota de un usuario.
 * Incluye el countdown del rate limit sincronizado con el scheduler del backend.
 */
export const useQuota = (userId) => {
  const [quotaStatus,      setQuotaStatus]      = useState(null)
  const [usageHistory,     setUsageHistory]      = useState([])
  const [secondsUntilReset,setSecondsUntilReset] = useState(60)
  const [loading,          setLoading]           = useState(true)
  const [error,            setError]             = useState(null)
  const countdownRef = useRef(null)

  const fetchQuotaData = useCallback(async () => {
    if (!userId) return
    try {
      setError(null)
      const [status, history] = await Promise.all([
        getQuotaStatus(userId),
        getUsageHistory(userId),
      ])
      setQuotaStatus(status)
      setUsageHistory(history)
    } catch (err) {
      setError('No se pudo cargar el estado de cuota')
      console.error('Error fetching quota data:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Carga inicial y cuando cambia el usuario
  useEffect(() => {
    fetchQuotaData()
  }, [fetchQuotaData])

  // Countdown sincronizado con el segundo 0 de cada minuto (igual que el scheduler)
  useEffect(() => {
    const now = new Date()
    setSecondsUntilReset(60 - now.getSeconds())

    countdownRef.current = setInterval(() => {
      setSecondsUntilReset((prev) => {
        if (prev <= 1) {
          fetchQuotaData()
          return 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownRef.current)
  }, [fetchQuotaData])

  const isRateLimited = quotaStatus
    ? quotaStatus.requestsThisMinute >= quotaStatus.maxRequestsPerMinute &&
      quotaStatus.plan !== 'ENTERPRISE'
    : false

  const isQuotaExhausted = quotaStatus
    ? quotaStatus.tokensRemaining <= 0 && quotaStatus.plan !== 'ENTERPRISE'
    : false

  const quotaPercentage = quotaStatus && quotaStatus.plan !== 'ENTERPRISE'
    ? Math.min(100, (quotaStatus.tokensUsed / quotaStatus.maxTokensPerMonth) * 100)
    : 0

  return {
    quotaStatus,
    usageHistory,
    secondsUntilReset,
    loading,
    error,
    isRateLimited,
    isQuotaExhausted,
    quotaPercentage,
    refreshQuota: fetchQuotaData,
  }
}
