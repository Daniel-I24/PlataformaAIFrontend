import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

/**
 * Gráfica de barras del historial de uso de tokens (últimos 7 días).
 * Usa Recharts con colores glassmorphism y tooltip personalizado.
 * La barra del día actual tiene un color diferente para destacarla.
 */

// Tooltip personalizado con estilo glassmorphism
const GlassTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div style={{
      background:     'rgba(15, 15, 35, 0.9)',
      backdropFilter: 'blur(16px)',
      border:         '1px solid rgba(99, 102, 241, 0.4)',
      borderRadius:   '10px',
      padding:        '10px 14px',
      boxShadow:      '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{label}</p>
      <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '700', color: '#818cf8' }}>
        {payload[0].value.toLocaleString()} tokens
      </p>
    </div>
  )
}

const UsageChart = ({ history }) => {
  const today = new Date().toDateString()

  // Formateo las fechas para el eje X
  const chartData = history.map((record) => {
    const date     = new Date(record.date)
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const isToday  = date.toDateString() === today
    return {
      day:     isToday ? 'Hoy' : `${dayNames[date.getDay()]} ${date.getDate()}`,
      tokens:  record.tokensUsed,
      isToday,
    }
  })

  return (
    <div>
      <p style={{
        fontSize:     '12px',
        fontWeight:   '600',
        color:        'rgba(255,255,255,0.6)',
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        Uso últimos 7 días
      </p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="tokens" radius={[4, 4, 0, 0]} maxBarSize={36}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isToday
                  ? 'url(#todayGradient)'
                  : 'rgba(99, 102, 241, 0.5)'}
              />
            ))}
          </Bar>
          {/* Gradiente para la barra del día actual */}
          <defs>
            <linearGradient id="todayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#818cf8" stopOpacity={1} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default UsageChart
