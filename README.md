# AI Proxy Frontend

Frontend de la plataforma de consumo de IA con Patrón Proxy.

## Tecnologías
- React 18
- Vite 5
- Recharts (gráficas)
- Axios (HTTP client)

## Características

- **Chat interface**: Envío de prompts al servicio de IA
- **Barra de cuota**: Progreso de tokens usados vs disponibles
- **Rate limit counter**: Contador con countdown hasta el reset
- **Gráfica de barras**: Historial de uso de los últimos 7 días
- **Modal de upgrade**: Simulación de pago para cambiar de plan
- **Badge de plan**: Indicador visual del plan actual (FREE/PRO/ENTERPRISE)
- **Estimador de tokens**: Estimación antes de enviar el prompt

## Ejecutar localmente

```bash
npm install
npm run dev
```

El frontend inicia en `http://localhost:5173`

> El proxy de Vite redirige `/api` → `http://localhost:8080` automáticamente en desarrollo.

## Variables de entorno

| Variable       | Descripción                    | Default |
|----------------|--------------------------------|---------|
| VITE_API_URL   | URL del backend en producción  | ''      |

## Despliegue en Vercel

1. Conectar el repositorio en Vercel
2. Framework preset: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`
5. Configurar variable de entorno `VITE_API_URL` con la URL de Railway

## Usuarios de prueba

La aplicación incluye tres usuarios de prueba:
- `user-free` → Plan FREE (10 req/min, 50k tokens/mes)
- `user-pro` → Plan PRO (60 req/min, 500k tokens/mes)
- `user-enterprise` → Plan ENTERPRISE (ilimitado)
