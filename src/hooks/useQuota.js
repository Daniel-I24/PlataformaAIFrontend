import { useState, useEffect, useCallback, useRef } from 'react'
import { getQuotaStatus, getUsageHistory } from '../api/aiApi'

/**
 * Hook personalizado para gestionar el estado de cuota de un usuario.
 * Centralizo aquí toda la lógica de estado para mantener los componentes limpios.
 * Incluye el countdown del rate limit y la actualización automática de cuota.
 */
export const useQuota = (userId) => {
  // Estado de la cuota del usuario
  const [quotaStatus, setQuotaStatus] = useState(null)
  // Historial de uso de los últimos 7 días
  const [usageHistory, setUsageHistory] = useState([])
  // Segundos restantes hasta el reset del rate limit
  const [secondsUntilReset, setSecondsUntilReset] = useState(60)
  // Estado de carga
  const [loading, setLoading] = useState(true)
  // Error en la carga de cuota
  const [error, setError] = useState(null)

  // Referencia al intervalo del countdown para limpiarlo correctamente
  const countdownRef = useRef(null)

  /**
   * Cargo el estado de cuota e historial del usuario.
   * Uso useCallback para evitar recrear la función en cada render.
   */
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

  // Cargo los datos al montar el componente y cuando cambia el userId
  useEffect(() => {
    fetchQuotaData()
  }, [fetchQuotaData])

  // Manejo el countdown del rate limit
  // Se resetea cada 60 segundos (sincronizado con el scheduler del backend)
  useEffect(() => {
    // Calculo los segundos restantes hasta el próximo minuto completo
    const now = new Date()
    const secondsInCurrentMinute = now.getSeconds()
    const initialSeconds = 60 - secondsInCurrentMinute

    setSecondsUntilReset(initialSeconds)

    // Inicio el countdown
    countdownRef.current = setInterval(() => {
      setSecondsUntilReset((prev) => {
        if (prev <= 1) {
          // Al llegar a 0, recargo la cuota (el backend ya reseteó el rate limit)
          fetchQuotaData()
          return 60
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [fetchQuotaData])

  /**
   * Verifico si el usuario está en el límite de rate limit.
   * Uso los datos del estado de cuota para determinarlo.
   */
  const isRateLimited = quotaStatus
    ? quotaStatus.requestsThisMinute >= quotaStatus.maxRequestsPerMinute &&
      quotaStatus.plan !== 'ENTERPRISE'
    : false

  /**
   * Verifico si el usuario agotó su cuota mensual.
   */
  const isQuotaExhausted = quotaStatus
    ? quotaStatus.tokensRemaining <= 0 && quotaStatus.plan !== 'ENTERPRISE'
    : false

  /**
   * Calculo el porcentaje de uso de la cuota mensual.
   */
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
