import { useState } from 'react'
import { upgradePlan } from '../api/aiApi'

/**
 * Modal de upgrade de plan con simulación de pago en 3 pasos.
 * Se muestra cuando el usuario agota su cuota mensual o hace clic en "Mejorar plan".
 * Diseño glassmorphism con overlay oscuro y animación de entrada.
 */

const PLAN_INFO = {
  FREE: {
    name:        'Free',
    price:       '$0/mes',
    gradient:    'linear-gradient(135deg, #10b981, #059669)',
    glow:        'rgba(16, 185, 129, 0.3)',
    features:    ['10 requests/min', '50,000 tokens/mes', 'Soporte básico'],
    icon:        '🌱',
  },
  PRO: {
    name:        'Pro',
    price:       '$29/mes',
    gradient:    'linear-gradient(135deg, #6366f1, #4f46e5)',
    glow:        'rgba(99, 102, 241, 0.3)',
    features:    ['60 requests/min', '500,000 tokens/mes', 'Soporte prioritario', 'Analytics avanzado'],
    icon:        '⚡',
    recommended: true,
  },
  ENTERPRISE: {
    name:        'Enterprise',
    price:       '$199/mes',
    gradient:    'linear-gradient(135deg, #a855f7, #7c3aed)',
    glow:        'rgba(168, 85, 247, 0.3)',
    features:    ['Requests ilimitados', 'Tokens ilimitados', 'Soporte 24/7', 'SLA garantizado', 'API dedicada'],
    icon:        '🚀',
  },
}

const UpgradeModal = ({ isOpen, onClose, userId, currentPlan, onUpgradeSuccess }) => {
  const [selectedPlan,  setSelectedPlan]  = useState('PRO')
  const [paymentStep,   setPaymentStep]   = useState('select') // 'select' | 'payment' | 'success'
  const [isProcessing,  setIsProcessing]  = useState(false)
  const [errorMessage,  setErrorMessage]  = useState(null)

  if (!isOpen) return null

  const handlePayment = async () => {
    setIsProcessing(true)
    setErrorMessage(null)

    // Simulo el procesamiento del pago (2 segundos)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    try {
      const newStatus = await upgradePlan(userId, selectedPlan)
      setPaymentStep('success')
      setTimeout(() => {
        onUpgradeSuccess(newStatus)
        onClose()
        setPaymentStep('select')
        setSelectedPlan('PRO')
      }, 2000)
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al procesar el upgrade. Intenta de nuevo.'
      setErrorMessage(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (isProcessing) return // No cierro mientras procesa
    onClose()
    setPaymentStep('select')
    setErrorMessage(null)
  }

  return (
    // Overlay con blur
    <div
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      style={{
        position:        'fixed',
        inset:           0,
        background:      'rgba(0, 0, 0, 0.7)',
        backdropFilter:  'blur(6px)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        zIndex:          1000,
        padding:         '16px',
      }}
    >
      {/* Panel del modal */}
      <div style={{
        background:     'rgba(15, 15, 35, 0.95)',
        backdropFilter: 'blur(24px)',
        border:         '1px solid rgba(255,255,255,0.12)',
        borderRadius:   '20px',
        padding:        '32px',
        maxWidth:       '580px',
        width:          '100%',
        maxHeight:      '90vh',
        overflowY:      'auto',
        boxShadow:      '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.1)',
        animation:      'fadeInUp 0.25s ease-out',
      }}>

        {/* ===== PASO 1: Selección de plan ===== */}
        {paymentStep === 'select' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🚀</div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: 'rgba(255,255,255,0.95)' }}>
                Actualiza tu plan
              </h2>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                Elige el plan que mejor se adapte a tus necesidades
              </p>
            </div>

            {/* Tarjetas de planes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {Object.entries(PLAN_INFO).map(([planKey, info]) => {
                const isCurrentPlan = planKey === currentPlan
                const isSelected    = planKey === selectedPlan

                return (
                  <div
                    key={planKey}
                    onClick={() => !isCurrentPlan && setSelectedPlan(planKey)}
                    style={{
                      position:       'relative',
                      border:         `1px solid ${isSelected ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius:   '14px',
                      padding:        '16px 12px',
                      cursor:         isCurrentPlan ? 'default' : 'pointer',
                      opacity:        isCurrentPlan ? 0.45 : 1,
                      background:     isSelected ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                      transition:     'all 0.2s ease',
                      boxShadow:      isSelected ? `0 0 20px ${info.glow}` : 'none',
                    }}
                  >
                    {info.recommended && (
                      <div style={{
                        position:     'absolute',
                        top:          '-10px',
                        left:         '50%',
                        transform:    'translateX(-50%)',
                        background:   info.gradient,
                        color:        'white',
                        fontSize:     '9px',
                        fontWeight:   '700',
                        padding:      '2px 8px',
                        borderRadius: '10px',
                        whiteSpace:   'nowrap',
                        letterSpacing: '0.5px',
                      }}>
                        RECOMENDADO
                      </div>
                    )}
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>{info.icon}</div>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: 'rgba(255,255,255,0.9)' }}>
                      {info.name}
                    </div>
                    <div style={{
                      fontWeight:   '700',
                      fontSize:     '16px',
                      margin:       '4px 0 8px',
                      background:   info.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor:  'transparent',
                    }}>
                      {info.price}
                    </div>
                    <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                      {info.features.map((f) => (
                        <li key={f} style={{ marginBottom: '3px' }}>{f}</li>
                      ))}
                    </ul>
                    {isCurrentPlan && (
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '8px', fontStyle: 'italic' }}>
                        Plan actual
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleClose} style={secondaryButtonStyle}>
                Cancelar
              </button>
              <button
                onClick={() => setPaymentStep('payment')}
                disabled={selectedPlan === currentPlan}
                style={{
                  ...primaryButtonStyle,
                  background: selectedPlan === currentPlan
                    ? 'rgba(255,255,255,0.08)'
                    : PLAN_INFO[selectedPlan]?.gradient,
                  cursor: selectedPlan === currentPlan ? 'not-allowed' : 'pointer',
                  boxShadow: selectedPlan === currentPlan ? 'none' : `0 0 20px ${PLAN_INFO[selectedPlan]?.glow}`,
                }}
              >
                Continuar con {PLAN_INFO[selectedPlan]?.name}
              </button>
            </div>
          </>
        )}

        {/* ===== PASO 2: Simulación de pago ===== */}
        {paymentStep === 'payment' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>💳</div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: 'rgba(255,255,255,0.95)' }}>
                Simulación de pago
              </h2>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                Plan {PLAN_INFO[selectedPlan]?.name} — {PLAN_INFO[selectedPlan]?.price}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'Número de tarjeta', value: '4242 4242 4242 4242' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '5px' }}>
                    {label}
                  </label>
                  <input
                    defaultValue={value}
                    readOnly
                    style={glassInputStyle}
                  />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Vencimiento', value: '12/28' },
                  { label: 'CVV',         value: '123'   },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '5px' }}>
                      {label}
                    </label>
                    <input defaultValue={value} readOnly style={glassInputStyle} />
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', margin: 0 }}>
                🔒 Pago simulado — No se realizará ningún cargo real
              </p>
            </div>

            {/* Error de pago */}
            {errorMessage && (
              <div style={{
                padding:      '10px 14px',
                background:   'rgba(239,68,68,0.1)',
                border:       '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                color:        '#fca5a5',
                fontSize:     '13px',
                marginBottom: '16px',
              }}>
                ⚠️ {errorMessage}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setPaymentStep('select')} disabled={isProcessing} style={secondaryButtonStyle}>
                Atrás
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                style={{
                  ...primaryButtonStyle,
                  background: isProcessing ? 'rgba(255,255,255,0.1)' : PLAN_INFO[selectedPlan]?.gradient,
                  cursor:     isProcessing ? 'not-allowed' : 'pointer',
                  boxShadow:  isProcessing ? 'none' : `0 0 20px ${PLAN_INFO[selectedPlan]?.glow}`,
                }}
              >
                {isProcessing ? '⏳ Procesando...' : `Pagar ${PLAN_INFO[selectedPlan]?.price}`}
              </button>
            </div>
          </>
        )}

        {/* ===== PASO 3: Éxito ===== */}
        {paymentStep === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: 'rgba(255,255,255,0.95)' }}>
              ¡Plan actualizado!
            </h2>
            <p style={{ margin: '10px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
              Tu plan ha sido actualizado a <strong style={{ color: 'rgba(255,255,255,0.8)' }}>
                {PLAN_INFO[selectedPlan]?.name}
              </strong>. Ya puedes continuar usando el servicio.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ---- Estilos reutilizables ----
const primaryButtonStyle = {
  flex:         2,
  padding:      '12px',
  border:       'none',
  borderRadius: '10px',
  color:        'white',
  fontSize:     '14px',
  fontWeight:   '600',
}

const secondaryButtonStyle = {
  flex:           1,
  padding:        '12px',
  border:         '1px solid rgba(255,255,255,0.12)',
  borderRadius:   '10px',
  background:     'rgba(255,255,255,0.05)',
  color:          'rgba(255,255,255,0.7)',
  cursor:         'pointer',
  fontSize:       '14px',
}

const glassInputStyle = {
  width:          '100%',
  padding:        '10px 14px',
  border:         '1px solid rgba(255,255,255,0.1)',
  borderRadius:   '10px',
  background:     'rgba(255,255,255,0.05)',
  color:          'rgba(255,255,255,0.7)',
  fontSize:       '14px',
  boxSizing:      'border-box',
  outline:        'none',
  fontFamily:     'inherit',
}

export default UpgradeModal
