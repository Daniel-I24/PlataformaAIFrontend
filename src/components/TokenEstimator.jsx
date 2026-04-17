/**
 * Estimador de tokens que consumirá un prompt antes de enviarlo.
 * Usa la misma fórmula que el backend para consistencia.
 * Diseño glassmorphism con colores de estado dinámicos.
 */

// Debe coincidir con QuotaProxyService.ESTIMATED_RESPONSE_TOKENS
const ESTIMATED_RESPONSE_TOKENS = 80
const CHARS_PER_TOKEN = 4

const TokenEstimator = ({ prompt, tokensRemaining, plan }) => {
  if (!prompt || prompt.trim().length === 0) return null

  const promptTokens    = Math.max(1, Math.floor(prompt.length / CHARS_PER_TOKEN))
  const estimatedTotal  = promptTokens + ESTIMATED_RESPONSE_TOKENS
  const hasEnoughTokens = plan === 'ENTERPRISE' || tokensRemaining >= estimatedTotal
  const isClose         = plan !== 'ENTERPRISE' && tokensRemaining < estimatedTotal * 2 && hasEnoughTokens

  const getStyle = () => {
    if (!hasEnoughTokens) return {
      bg:     'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
      color:  '#fca5a5',
      icon:   '❌',
    }
    if (isClose) return {
      bg:     'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
      color:  '#fcd34d',
      icon:   '⚠️',
    }
    return {
      bg:     'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
      color:  '#6ee7b7',
      icon:   '✅',
    }
  }

  const style = getStyle()

  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      gap:            '8px',
      padding:        '7px 12px',
      background:     style.bg,
      border:         `1px solid ${style.border}`,
      borderRadius:   '8px',
      fontSize:       '12px',
      backdropFilter: 'blur(8px)',
    }}>
      <span>{style.icon}</span>
      <span style={{ color: style.color, fontWeight: '500' }}>
        ~{estimatedTotal} tokens estimados
        {!hasEnoughTokens && ' — Cuota insuficiente'}
        {hasEnoughTokens && isClose && ' — Pocos tokens restantes'}
      </span>
      <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 'auto', fontSize: '11px' }}>
        {promptTokens} prompt + ~{ESTIMATED_RESPONSE_TOKENS} respuesta
      </span>
    </div>
  )
}

export default TokenEstimator
