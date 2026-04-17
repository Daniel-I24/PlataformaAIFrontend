/**
 * Contador de requests por minuto con countdown hasta el reset.
 * Muestra una barra de progreso y alerta cuando se alcanza el límite.
 * Diseño glassmorphism con indicadores de color dinámicos.
 */

const RateLimitCounter = ({ requestsThisMinute, maxRequestsPerMinute, secondsUntilReset, plan }) => {

  // Para ENTERPRISE no hay límite de rate
  if (plan === 'ENTERPRISE') {
    return (
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>
            Requests / minuto
          </span>
          <span style={{ fontSize: '12px', color: '#a855f7', fontWeight: '700' }}>
            ∞ Sin límite
          </span>
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
          {requestsThisMinute} requests este minuto
        </div>
      </div>
    )
  }

  const percentage = Math.min(100, (requestsThisMinute / maxRequestsPerMinute) * 100)
  const isAtLimit  = requestsThisMinute >= maxRequestsPerMinute
  const isWarning  = percentage >= 80

  const getBarGradient = () => {
    if (isAtLimit)  return 'linear-gradient(90deg, #ef4444, #dc2626)'
    if (isWarning)  return 'linear-gradient(90deg, #f59e0b, #d97706)'
    return                 'linear-gradient(90deg, #6366f1, #4f46e5)'
  }

  const getGlowColor = () => {
    if (isAtLimit) return 'rgba(239, 68, 68, 0.5)'
    if (isWarning) return 'rgba(245, 158, 11, 0.5)'
    return                'rgba(99, 102, 241, 0.4)'
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>
          Requests / minuto
        </span>
        <span style={{
          fontSize:   '12px',
          fontWeight: '700',
          color:      isAtLimit ? '#ef4444' : isWarning ? '#f59e0b' : 'rgba(255,255,255,0.7)',
        }}>
          {requestsThisMinute} / {maxRequestsPerMinute}
        </span>
      </div>

      {/* Barra de progreso */}
      <div style={{
        height:       '8px',
        borderRadius: '4px',
        background:   'rgba(255,255,255,0.08)',
        border:       '1px solid rgba(255,255,255,0.06)',
        overflow:     'hidden',
        marginBottom: '5px',
      }}>
        <div style={{
          height:       '100%',
          width:        `${percentage}%`,
          background:   getBarGradient(),
          borderRadius: '4px',
          boxShadow:    `0 0 8px ${getGlowColor()}`,
          transition:   'width 0.3s ease',
          animation:    isAtLimit ? 'pulse 1s ease-in-out infinite' : 'none',
        }} />
      </div>

      {/* Countdown y estado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
          🔄 Reset en {secondsUntilReset}s
        </span>
        {isAtLimit && (
          <span style={{
            fontSize:   '11px',
            color:      '#ef4444',
            fontWeight: '600',
            animation:  'pulse 1s ease-in-out infinite',
          }}>
            ⚠ Límite alcanzado
          </span>
        )}
      </div>
    </div>
  )
}

export default RateLimitCounter
