import { useState, useRef, useEffect } from 'react'
import TokenEstimator from './TokenEstimator'

/**
 * Área de entrada del chat con estimador de tokens integrado.
 * El botón de envío se deshabilita automáticamente según el estado del sistema.
 * Diseño glassmorphism con textarea auto-expandible.
 */

const ChatInput = ({
  onSend,
  isLoading,
  isRateLimited,
  isQuotaExhausted,
  secondsUntilReset,
  tokensRemaining,
  plan,
}) => {
  const [prompt, setPrompt]   = useState('')
  const textareaRef           = useRef(null)

  // Auto-resize del textarea según el contenido (máximo 150px)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height =
        `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }, [prompt])

  const handleSend = () => {
    if (!prompt.trim() || isLoading || isRateLimited || isQuotaExhausted) return
    onSend(prompt.trim())
    setPrompt('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Estado del botón según la situación actual
  const getButtonConfig = () => {
    if (isLoading)       return { disabled: true,  text: '⏳ Generando...',          bg: 'rgba(255,255,255,0.1)' }
    if (isRateLimited)   return { disabled: true,  text: `⏱ ${secondsUntilReset}s`, bg: 'rgba(245,158,11,0.3)' }
    if (isQuotaExhausted)return { disabled: true,  text: '🚫 Sin cuota',             bg: 'rgba(239,68,68,0.3)'  }
    if (!prompt.trim())  return { disabled: true,  text: 'Enviar',                   bg: 'rgba(255,255,255,0.08)'}
    return                      { disabled: false, text: 'Enviar ↵',                 bg: 'linear-gradient(135deg, #6366f1, #4f46e5)' }
  }

  const buttonConfig = getButtonConfig()
  const isDisabled   = isRateLimited || isQuotaExhausted || isLoading

  return (
    <div style={{
      padding:        '14px 16px',
      borderTop:      '1px solid rgba(255,255,255,0.06)',
      background:     'rgba(0,0,0,0.2)',
      backdropFilter: 'blur(8px)',
    }}>
      {/* Estimador de tokens */}
      {prompt.trim() && (
        <div style={{ marginBottom: '8px' }}>
          <TokenEstimator
            prompt={prompt}
            tokensRemaining={tokensRemaining}
            plan={plan}
          />
        </div>
      )}

      {/* Alerta de rate limit */}
      {isRateLimited && (
        <div style={{
          marginBottom:   '8px',
          padding:        '8px 12px',
          background:     'rgba(245, 158, 11, 0.1)',
          border:         '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius:   '8px',
          fontSize:       '12px',
          color:          '#fcd34d',
          display:        'flex',
          alignItems:     'center',
          gap:            '6px',
        }}>
          ⏱ Rate limit alcanzado. Podrás enviar en <strong>{secondsUntilReset} segundos</strong>.
        </div>
      )}

      {/* Área de texto + botón */}
      <div style={{
        display:        'flex',
        gap:            '10px',
        alignItems:     'flex-end',
        background:     'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        border:         `1px solid ${isDisabled ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.4)'}`,
        borderRadius:   '14px',
        padding:        '10px 14px',
        transition:     'border-color 0.2s ease',
      }}>
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          rows={1}
          placeholder={
            isRateLimited    ? `Rate limit. Espera ${secondsUntilReset}s...` :
            isQuotaExhausted ? 'Cuota agotada. Haz upgrade de plan.' :
            isLoading        ? 'Generando respuesta...' :
            'Escribe tu prompt... (Enter para enviar)'
          }
          style={{
            flex:        1,
            border:      'none',
            outline:     'none',
            resize:      'none',
            fontSize:    '14px',
            lineHeight:  '1.5',
            background:  'transparent',
            color:       isDisabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)',
            fontFamily:  'inherit',
            minHeight:   '24px',
          }}
        />
        <button
          onClick={handleSend}
          disabled={buttonConfig.disabled}
          style={{
            padding:       '8px 18px',
            border:        'none',
            borderRadius:  '10px',
            background:    buttonConfig.bg,
            color:         'white',
            cursor:        buttonConfig.disabled ? 'not-allowed' : 'pointer',
            fontSize:      '13px',
            fontWeight:    '600',
            whiteSpace:    'nowrap',
            transition:    'all 0.2s ease',
            flexShrink:    0,
            boxShadow:     buttonConfig.disabled ? 'none' : '0 0 15px rgba(99,102,241,0.4)',
          }}
        >
          {buttonConfig.text}
        </button>
      </div>

      <div style={{
        fontSize:   '11px',
        color:      'rgba(255,255,255,0.2)',
        marginTop:  '6px',
        textAlign:  'center',
      }}>
        Shift+Enter para nueva línea • Enter para enviar
      </div>
    </div>
  )
}

export default ChatInput
