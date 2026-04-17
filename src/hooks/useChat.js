import { useState, useCallback } from 'react'
import { generateText } from '../api/aiApi'

/**
 * Hook personalizado para gestionar el estado del chat.
 * Maneja el historial de mensajes, el estado de carga y los errores de la API.
 */
export const useChat = (userId, onQuotaUpdate) => {
  // Historial de mensajes del chat
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de IA. Escribe un prompt y lo procesaré. Ten en cuenta que tu plan tiene límites de requests por minuto y tokens mensuales.',
      timestamp: new Date().toISOString(),
    }
  ])
  // Estado de carga mientras se procesa el request
  const [isLoading, setIsLoading] = useState(false)
  // Error del último request
  const [lastError, setLastError] = useState(null)

  /**
   * Envío un mensaje al servicio de IA y agrego la respuesta al historial.
   * Manejo los errores específicos de rate limit y cuota agotada.
   */
  const sendMessage = useCallback(async (prompt) => {
    if (!prompt.trim() || isLoading) return

    // Agrego el mensaje del usuario al historial inmediatamente
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setLastError(null)

    try {
      const response = await generateText(userId, prompt)

      // Agrego la respuesta del asistente al historial
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.generatedText,
        timestamp: new Date().toISOString(),
        metadata: {
          tokensConsumed: response.tokensConsumed,
          tokensRemaining: response.tokensRemaining,
          requestsThisMinute: response.requestsThisMinute,
        },
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Notifico al componente padre para actualizar el estado de cuota
      if (onQuotaUpdate) {
        onQuotaUpdate()
      }
    } catch (error) {
      // Extraigo el error de la respuesta del backend
      const errorData = error.response?.data
      const errorCode = errorData?.error || 'UNKNOWN_ERROR'
      const errorMessage = errorData?.message || 'Ocurrió un error al procesar tu solicitud'
      const errorDetails = errorData?.details || {}

      setLastError({
        code: errorCode,
        message: errorMessage,
        details: errorDetails,
        status: error.response?.status,
      })

      // Agrego un mensaje de error al chat para que el usuario lo vea
      const errorMessage2 = {
        id: `error-${Date.now()}`,
        role: 'error',
        content: errorMessage,
        errorCode,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage2])

      // Actualizo la cuota incluso en caso de error (el rate limit se incrementó)
      if (onQuotaUpdate) {
        onQuotaUpdate()
      }
    } finally {
      setIsLoading(false)
    }
  }, [userId, isLoading, onQuotaUpdate])

  /**
   * Limpio el historial de mensajes (excepto el mensaje de bienvenida).
   */
  const clearMessages = useCallback(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de IA. Escribe un prompt y lo procesaré.',
      timestamp: new Date().toISOString(),
    }])
    setLastError(null)
  }, [])

  return {
    messages,
    isLoading,
    lastError,
    sendMessage,
    clearMessages,
  }
}
