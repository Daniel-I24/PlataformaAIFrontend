/**
 * Badge visual del plan actual del usuario.
 * Cada plan tiene colores y gradientes diferenciados para identificación rápida.
 * Diseño glassmorphism con bordes luminosos.
 */

const PLAN_CONFIG = {
  FREE: {
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    glow:     'rgba(16, 185, 129, 0.4)',
    border:   'rgba(16, 185, 129, 0.5)',
    label:    'FREE',
    icon:     '🌱',
  },
  PRO: {
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    glow:     'rgba(99, 102, 241, 0.4)',
    border:   'rgba(99, 102, 241, 0.5)',
    label:    'PRO',
    icon:     '⚡',
  },
  ENTERPRISE: {
    gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    glow:     'rgba(168, 85, 247, 0.4)',
    border:   'rgba(168, 85, 247, 0.5)',
    label:    'ENTERPRISE',
    icon:     '🚀',
  },
}

const PlanBadge = ({ plan, size = 'sm' }) => {
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.FREE
  const isLarge = size === 'lg'

  return (
    <span
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            '5px',
        padding:        isLarge ? '6px 14px' : '3px 10px',
        borderRadius:   '20px',
        fontSize:       isLarge ? '13px' : '11px',
        fontWeight:     '700',
        letterSpacing:  '0.8px',
        background:     config.gradient,
        border:         `1px solid ${config.border}`,
        boxShadow:      `0 0 12px ${config.glow}`,
        color:          'white',
        textShadow:     '0 1px 2px rgba(0,0,0,0.3)',
        whiteSpace:     'nowrap',
      }}
    >
      {config.icon} {config.label}
    </span>
  )
}

export default PlanBadge
