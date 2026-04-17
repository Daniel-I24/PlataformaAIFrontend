/**
 * Renderiza un mensaje individual del chat.
 * Soporta tres roles: 'user', 'assistant' y 'error'.
 * Diseño glassmorphism con burbujas diferenciadas por rol.
 */

const ChatMessage = ({ message }) => {
  const isUser      = message.role === 'user'
  const isError     = message.role === 'error'
  const isAssistant = message.role === 'assistant'

  const time = new Date(message.timestamp).toLocaleTimeString('es-CO', {
    hour:   '2-digit',
    minute: '2-digit',
  })

  // ---- Mensaje del usuario ----
  if (isUser) {
    return (
      <div className="animate-fade-in-up" style={{
        display:       'flex',
        justifyContent: 'flex-end',
        marginBottom:  '16px',
      }}>
        <div style={{ maxWidth: '75%' }}>
          <div style={{
            background:     'linear-gradient(135deg, #6366f1, #4f46e5)',
            color:          'white',
            padding:        '12px 16px',
            borderRadius:   '18px 18px 4px 18px',
            fontSize:       '14px',
            lineHeight:     '1.6',
            boxShadow:      '0 4px 20px rgba(99, 102, 241, 0.3)',
            wordBreak:      'break-word',
          }}>
            {message.content}
          </div>
          <div style={{
            fontSize:   '11px',
            color:      'rgba(255,255,255,0.3)',
            textAlign:  'right',
            marginTop:  '4px',
          }}>
            {time}
          </div>
        </div>
      </div>
    )
  }

  // ---- Mensaje de error ----
  if (isError) {
    return (
      <div className="animate-fade-in-up" style={{
        display:       'flex',
        justifyContent: 'flex-start',
        marginBottom:  '16px',
      }}>
        <div style={{ maxWidth: '80%' }}>
          <div style={{
            background:     'rgba(239, 68, 68, 0.12)',
            backdropFilter: 'blur(8px)',
            border:         '1px solid rgba(239, 68, 68, 0.3)',
            color:          '#fca5a5',
            padding:        '12px 16px',
            borderRadius:   '4px 18px 18px 18px',
            fontSize:       '14px',
            lineHeight:     '1.6',
          }}>
            <span style={{ marginRight: '6px' }}>⚠️</span>
            {message.content}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
            {time}
          </div>
        </div>
      </div>
    )
  }

  // ---- Mensaje del asistente ----
  return (
    <div className="animate-fade-in-up" style={{
      display:       'flex',
      justifyContent: 'flex-start',
      marginBottom:  '16px',
    }}>
      <div style={{ maxWidth: '82%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          {/* Avatar del asistente */}
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
            boxShadow:      '0 0 12px rgba(168, 85, 247, 0.4)',
          }}>
            🤖
          </div>

          <div style={{ flex: 1 }}>
            {/* Burbuja de respuesta */}
            <div style={{
              background:     'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(12px)',
              border:         '1px solid rgba(255, 255, 255, 0.10)',
              color:          'rgba(255,255,255,0.9)',
              padding:        '12px 16px',
              borderRadius:   '4px 18px 18px 18px',
              fontSize:       '14px',
              lineHeight:     '1.7',
              wordBreak:      'break-word',
            }}>
              {message.content}
            </div>

            {/* Metadatos de consumo de tokens */}
            {message.metadata && (
              <div style={{
                display:    'flex',
                gap:        '14px',
                marginTop:  '6px',
                fontSize:   '11px',
                color:      'rgba(255,255,255,0.35)',
                flexWrap:   'wrap',
              }}>
                <span>🔢 {message.metadata.tokensConsumed} tokens</span>
                {message.metadata.tokensRemaining !== undefined &&
                  message.metadata.tokensRemaining < 2147483647 && (
                  <span>📊 {message.metadata.tokensRemaining.toLocaleString()} restantes</span>
                )}
              </div>
            )}

            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
              {time}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
