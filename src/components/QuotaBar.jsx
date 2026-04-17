/**
 * Barra de progreso de la cuota mensual de tokens.
 * El color y el brillo cambian según el porcentaje de uso para alertar al usuario.
 * Diseño glassmorphism con animación suave en la barra.
 */

const QuotaBar = ({ tokensUsed, tokensRemaining, maxTokens, plan, percentage }) => {

  // Determino el color de la barra según el porcentaje de uso
  const getBarGradient = () => {
    if (plan === 'ENTERPRISE') return 'linear-gradient(90deg, #a855f7, #6366f1)'
    if (percentage >= 90)      return 'linear-gradient(90deg, #ef4444, #dc2626)'
    if (percentage >= 70)      return 'linear-gradient(90deg, #f59e0b, #d97706)'
    return                            'linear-gradient(90deg, #10b981, #059669)'
  }

  const getGlowColor = () => {
    if (plan === 'ENTERPRISE') return 'rgba(168, 85, 247, 0.5)'
    if (percentage >= 90)      return 'rgba(239, 68, 68, 0.5)'
    if (percentage >= 70)      return 'rgba(245, 158, 11, 0.5)'
    return                            'rgba(16, 185, 129, 0.5)'
  }

  const getStatusLabel = () => {
    if (plan === 'ENTERPRISE') return '∞ Ilimitado'
    if (percentage >= 90)      return '⚠ Casi agotado'
    if (percentage >= 70)      return 'Uso alto'
    return 'Normal'
  }

  // Para ENTERPRISE mostramos un indicador especial
  if (plan === 'ENTERPRISE') {
    return (
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>
            Tokens mensuales
          </span>
          <span style={{ fontSize: '12px', color: '#a855f7', fontWeight: '700' }}>
            ∞ Ilimitado
          </span>
        </div>
        <div style={{
          height:       '8px',
          borderRadius: '4px',
          background:   'linear-gradient(90deg, #a855f7, #6366f1, #06b6d4)',
          backgroundSize: '200% 100%',
          animation:    'shimmer 2s linear infinite',
          boxShadow:    '0 0 10px rgba(168, 85, 247, 0.5)',
        }} />
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '5px' }}>
          {tokensUsed.toLocaleString()} tokens usados este mes
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Encabezado con etiquetas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>
          Tokens mensuales
        </span>
        <span style={{
          fontSize:   '11px',
          color:      percentage >= 90 ? '#ef4444' : percentage >= 70 ? '#f59e0b' : 'rgba(255,255,255,0.5)',
          fontWeight: percentage >= 70 ? '600' : '400',
        }}>
          {getStatusLabel()}
        </span>
      </div>

      {/* Barra de progreso con glassmorphism */}
      <div style={{
        height:       '8px',
        borderRadius: '4px',
        background:   'rgba(255,255,255,0.08)',
        border:       '1px solid rgba(255,255,255,0.06)',
        overflow:     'hidden',
      }}>
        <div style={{
          height:           '100%',
          width:            `${percentage}%`,
          background:       getBarGradient(),
          borderRadius:     '4px',
          boxShadow:        `0 0 8px ${getGlowColor()}`,
          transition:       'width 0.6s ease, background 0.3s ease',
        }} />
      </div>

      {/* Valores numéricos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
          {tokensUsed.toLocaleString()} usados
        </span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
          {tokensRemaining.toLocaleString()} restantes
        </span>
      </div>

      {/* Barra de porcentaje */}
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px', textAlign: 'center' }}>
        {percentage.toFixed(1)}% de {maxTokens.toLocaleString()} tokens
      </div>
    </div>
  )
}

export default QuotaBar
