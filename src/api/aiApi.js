import axios from 'axios'

// URL base del backend - en producción usa la variable de entorno de Vite
// En desarrollo, Vite proxy redirige /api → http://localhost:8080
const BASE_URL = import.meta.env.VITE_API_URL || ''

// Instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 segundos (el backend tiene 1.2s de delay simulado)
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Envío un prompt al servicio de IA.
 * La solicitud pasa por el proxy chain completo en el backend.
 * @param {string} userId - ID del usuario
 * @param {string} prompt - Texto del prompt
 * @returns {Promise} Respuesta con texto generado y metadatos de consumo
 */
export const generateText = async (userId, prompt) => {
  const response = await apiClient.post('/api/ai/generate', { userId, prompt })
  return response.data
}

/**
 * Obtengo el estado actual de la cuota de un usuario.
 * @param {string} userId - ID del usuario
 * @returns {Promise} Estado de cuota con tokens usados, restantes y plan
 */
export const getQuotaStatus = async (userId) => {
  const response = await apiClient.get('/api/quota/status', { params: { userId } })
  return response.data
}

/**
 * Obtengo el historial de uso de los últimos 7 días.
 * @param {string} userId - ID del usuario
 * @returns {Promise} Array de 7 registros con fecha y tokens usados
 */
export const getUsageHistory = async (userId) => {
  const response = await apiClient.get('/api/quota/history', { params: { userId } })
  return response.data
}

/**
 * Actualizo el plan de un usuario.
 * @param {string} userId - ID del usuario
 * @param {string} newPlan - Nuevo plan (FREE, PRO, ENTERPRISE)
 * @returns {Promise} Nuevo estado de cuota después del upgrade
 */
export const upgradePlan = async (userId, newPlan) => {
  const response = await apiClient.post('/api/quota/upgrade', { userId, newPlan })
  return response.data
}

export default apiClient
