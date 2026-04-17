import { useState, useCallback } from 'react'
import { generateText } from '../api/aiApi'

/**
 * Gestiona el historial de mensajes del chat y el envío al backend.
 */
export const useChat = (userId, onQuotaUpdate) => {
  const [messages,  setMessages]  = useState([{
    id:        'welcome',
    role:      'assistant',
    content:   '¡Hola! Soy tu asistente de IA. Escribe un prompt y lo procesaré. Ten en cuenta que tu plan tiene límites de requests por minuto y tokens mensuales.',
    timestamp: new Date().toISOString(),
  }])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (prompt) => {
    if (!prompt.trim() || isLoading) return

    setMessages((prev) => [...prev, {
      id:        `user-${Date.now()}`,
      role:      'user',
      content:   prompt,
      timestamp: new Date().toISOString(),
    }])
    setIsLoading(true)

    try {
      const response = await generateText(userId, prompt)

      setMessages((prev) => [...prev, {
        id:        `assistant-${Date.now()}`,
        role:      'assistant',
        content:   response.generatedText,
        timestamp: new Date().toISOString(),
        metadata: {
          tokensConsumed:    response.tokensConsumed,
          tokensRemaining:   response.tokensRemaining,
          requestsThisMinute: response.requestsThisMinute,
        },
      }])
    } catch (error) {
      const errorData    = error.response?.data
      const errorMessage = errorData?.message || 'Ocurrió un error al procesar tu solicitud'

      setMessages((prev) => [...prev, {
        id:        `error-${Date.now()}`,
        role:      'error',
        content:   errorMessage,
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setIsLoading(false)
      // Actualizo la cuota siempre (el rate limit se incrementó incluso en error)
      onQuotaUpdate?.()
    }
  }, [userId, isLoading, onQuotaUpdate])

  const clearMessages = useCallback(() => {
    setMessages([{
      id:        'welcome',
      role:      'assistant',
      content:   '¡Hola! Soy tu asistente de IA. Escribe un prompt y lo procesaré.',
      timestamp: new Date().toISOString(),
    }])
  }, [])

  return { messages, isLoading, sendMessage, clearMessages }
}
