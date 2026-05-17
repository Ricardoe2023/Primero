export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  database: {
    url: process.env.DATABASE_URL,
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
  },
  payments: {
    mercadoPagoToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    mercadoPagoWebhookSecret: process.env.MERCADO_PAGO_WEBHOOK_SECRET,
  },
})
