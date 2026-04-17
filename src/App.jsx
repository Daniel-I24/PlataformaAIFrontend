import { useState, useRef, useEffect } from 'react'
import { useQuota } from './hooks/useQuota'
import { useChat }  from './hooks/useChat'
import PlanBadge         from './components/PlanBadge'
import QuotaBar          from './components/QuotaBar'
import RateLimitCounter  from './components/RateLimitCounter'
import UsageChart        from './components/UsageChart'
import ChatMessage       from './components/ChatMessage'
import ChatInput         from './components/ChatInput'
import UpgradeModal      from './components/UpgradeModal'

// Usuarios de prueba disponibles en el backend
const SAMPLE_USERS = [
  { id: 'user-free',       label: 'Usuario Free',       plan: 'FREE'       },
  { id: 'user-pro',        label: 'Usuario Pro',        plan: 'PRO'        },
  { id: 'user-enterprise', label: 'Usuario Enterprise', plan: 'ENTERPRISE' },
]

/**
 * Componente raíz de la aplicación.
 *
 * Arquitectura de estado:
 * - useQuota: gestiona cuota, historial y countdown del rate limit
 * - useChat:  gestiona el historial de mensajes y el envío
 * - Estado local: usuario seleccionado y visibilidad del modal
 *
 * El estado compartido vive aquí y se pasa hacia abajo como props
 * (patrón "lifting state up" de React).
 */
const App = () => {
  const [selectedUserId,   setSelectedUserId]   = useState('user-free')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const chatContainerRef = useRef(null)

  // Hook de cuota: estado de cuota, historial y countdown
  const {
    quotaStatus,
    usageHistory,
    secondsUntilReset,
    loading:          quotaLoading,
    error:            quotaError,
    isRateLimited,
    isQuotaExhausted,
    quotaPercentage,
    refreshQuota,
  } = useQuota(selectedUserId)

  // Hook de chat: historial de mensajes y envío
  const {
    messages,
    isLoading: chatLoading,
    sendMessage,
    clearMessages,
  } = useChat(selectedUserId, refreshQuota)

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Abro el modal de upgrade automáticamente cuando se agota la cuota
  useEffect(() => {
    if (isQuotaExhausted) {
      setShowUpgradeModal(true)
    }
  }, [isQuotaExhausted])

  const handleUserChange = (userId) => {
    setSelectedUserId(userId)
    clearMessages()
  }

  const handleUpgradeSuccess = () => {
    setShowUpgradeModal(false)
    refreshQuota()
  }

  return (
    <div style={{
      display:    'flex',
      height:     '100vh',
      position:   'relative',
      zIndex:     1,
      overflow:   'hidden',
    }}>

      {/* ================================================================
          PANEL LATERAL — Cuota, plan y estadísticas
          ================================================================ */}
      <aside style={{
        width:          '290px',
        flexShrink:     0,
        display:        'flex',
        flexDirection:  'column',
        background:     'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(20px)',
        borderRight:    '1px solid rgba(255, 255, 255, 0.08)',
        overflow:       'hidden',
      }}>

        {/* Header del panel lateral */}
        <div style={{
          padding:    '22px 20px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'linear-gradient(180deg, rgba(99,102,241,0.15) 0%, transparent 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{
              width:          '36px',
              height:         '36px',
              borderRadius:   '10px',
              background:     'linear-gradient(135deg, #6366f1, #a855f7)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontSize:       '18px',
              boxShadow:      '0 0 15px rgba(99,102,241,0.4)',
            }}>
              🤖
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'rgba(255,255,255,0.95)' }}>
                AI Platform
              </h1>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                Proxy Pattern Demo
              </p>
            </div>
          </div>
        </div>

        {/* Selector de usuario */}
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{
            fontSize:      '10px',
            fontWeight:    '600',
            color:         'rgba(255,255,255,0.35)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom:  '8px',
          }}>
            Usuario activo
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {SAMPLE_USERS.map((user) => {
              const isActive = selectedUserId === user.id
              return (
                <button
                  key={user.id}
                  onClick={() => handleUserChange(user.id)}
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'space-between',
                    padding:        '9px 12px',
                    border:         `1px solid ${isActive ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius:   '10px',
                    background:     isActive ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                    cursor:         'pointer',
                    fontSize:       '13px',
                    color:          isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)',
                    transition:     'all 0.2s ease',
                    boxShadow:      isActive ? '0 0 12px rgba(99,102,241,0.2)' : 'none',
                  }}
                >
                  <span>{user.label}</span>
                  <PlanBadge plan={user.plan} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Estado de cuota */}
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
          {quotaLoading ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px', padding: '24px 0' }}>
              <div className="animate-spin" style={{ fontSize: '20px', marginBottom: '8px' }}>⚙️</div>
              Cargando cuota...
            </div>
          ) : quotaError ? (
            <div style={{
              padding:      '12px',
              background:   'rgba(239,68,68,0.1)',
              border:       '1px solid rgba(239,68,68,0.2)',
              borderRadius: '10px',
              color:        '#fca5a5',
              fontSize:     '12px',
              textAlign:    'center',
            }}>
              ⚠️ {quotaError}
            </div>
          ) : quotaStatus ? (
            <>
              {/* Plan actual */}
              <div style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                marginBottom:   '18px',
                padding:        '10px 12px',
                background:     'rgba(255,255,255,0.04)',
                borderRadius:   '10px',
                border:         '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Plan actual</span>
                <PlanBadge plan={quotaStatus.plan} size="sm" />
              </div>

              {/* Barra de cuota mensual */}
              <QuotaBar
                tokensUsed={quotaStatus.tokensUsed}
                tokensRemaining={quotaStatus.tokensRemaining}
                maxTokens={quotaStatus.maxTokensPerMonth}
                plan={quotaStatus.plan}
                percentage={quotaPercentage}
              />

              {/* Contador de rate limit */}
              <RateLimitCounter
                requestsThisMinute={quotaStatus.requestsThisMinute}
                maxRequestsPerMinute={quotaStatus.maxRequestsPerMinute}
                secondsUntilReset={secondsUntilReset}
                plan={quotaStatus.plan}
              />

              {/* Fecha de reset mensual */}
              <div style={{
                padding:      '9px 12px',
                background:   'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                fontSize:     '11px',
                color:        'rgba(255,255,255,0.4)',
                marginBottom: '14px',
                border:       '1px solid rgba(255,255,255,0.05)',
              }}>
                🗓 Reset mensual:{' '}
                <strong style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {new Date(quotaStatus.resetDate).toLocaleDateString('es-CO', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </strong>
              </div>

              {/* Botón de upgrade */}
              {quotaStatus.plan !== 'ENTERPRISE' && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  style={{
                    width:        '100%',
                    padding:      '10px',
                    border:       '1px solid rgba(99,102,241,0.4)',
                    borderRadius: '10px',
                    background:   'rgba(99,102,241,0.12)',
                    color:        '#818cf8',
                    cursor:       'pointer',
                    fontSize:     '13px',
                    fontWeight:   '600',
                    marginBottom: '18px',
                    transition:   'all 0.2s ease',
                  }}
                >
                  ⬆ Mejorar plan
                </button>
              )}

              {/* Gráfica de uso */}
              {usageHistory.length > 0 && (
                <div style={{
                  padding:      '14px',
                  background:   'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  border:       '1px solid rgba(255,255,255,0.05)',
                }}>
                  <UsageChart history={usageHistory} />
                </div>
              )}
            </>
          ) : null}
        </div>
      </aside>

      {/* ================================================================
          PANEL PRINCIPAL — Chat
          ================================================================ */}
      <main style={{
        flex:          1,
        display:       'flex',
        flexDirection: 'column',
        overflow:      'hidden',
        background:    'rgba(0, 0, 0, 0.15)',
      }}>

        {/* Header del chat */}
        <div style={{
          padding:        '16px 24px',
          borderBottom:   '1px solid rgba(255,255,255,0.06)',
          background:     'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(12px)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>
              Chat con IA
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
              {selectedUserId} • {quotaStatus?.plan || '...'}
              {isRateLimited && (
                <span style={{ color: '#f59e0b', marginLeft: '8px' }}>
                  ⏱ Rate limit activo
                </span>
              )}
              {isQuotaExhausted && (
                <span style={{ color: '#ef4444', marginLeft: '8px' }}>
                  🚫 Cuota agotada
                </span>
              )}
            </p>
          </div>
          <button
            onClick={clearMessages}
            style={{
              padding:      '6px 14px',
              border:       '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              background:   'rgba(255,255,255,0.04)',
              color:        'rgba(255,255,255,0.5)',
              cursor:       'pointer',
              fontSize:     '12px',
              transition:   'all 0.2s ease',
            }}
          >
            🗑 Limpiar
          </button>
        </div>

        {/* Área de mensajes */}
        <div
          ref={chatContainerRef}
          style={{
            flex:       1,
            overflowY:  'auto',
            padding:    '24px',
            display:    'flex',
            flexDirection: 'column',
          }}
        >
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* Indicador de carga */}
          {chatLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{
                  width:          '32px',
                  height:         '32px',
                  borderRadius:   '50%',
                  background:     'linear-gradient(135deg, #a855f7, #6366f1)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       '15px',
                  flexShrink:     0,
                }}>
                  🤖
                </div>
                <div style={{
                  background:     'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(12px)',
                  border:         '1px solid rgba(255,255,255,0.10)',
                  padding:        '12px 18px',
                  borderRadius:   '4px 18px 18px 18px',
                  display:        'flex',
                  alignItems:     'center',
                  gap:            '10px',
                  color:          'rgba(255,255,255,0.5)',
                  fontSize:       '14px',
                }}>
                  {/* Puntos animados de "escribiendo" */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{
                        width:        '6px',
                        height:       '6px',
                        borderRadius: '50%',
                        background:   '#818cf8',
                        animation:    `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                  Generando respuesta...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input del chat */}
        <ChatInput
          onSend={sendMessage}
          isLoading={chatLoading}
          isRateLimited={isRateLimited}
          isQuotaExhausted={isQuotaExhausted}
          secondsUntilReset={secondsUntilReset}
          tokensRemaining={quotaStatus?.tokensRemaining || 0}
          plan={quotaStatus?.plan || 'FREE'}
        />
      </main>

      {/* Modal de upgrade */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        userId={selectedUserId}
        currentPlan={quotaStatus?.plan || 'FREE'}
        onUpgradeSuccess={handleUpgradeSuccess}
      />
    </div>
  )
}

export default App
