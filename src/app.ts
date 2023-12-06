import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import { mealsRoutes } from './routes/meals'
import { authRoutes } from './routes/auth'
import { usersRoutes } from './routes/users'
import { metricsRoutes } from './routes/metrics'
import cookie from '@fastify/cookie'

export const app = fastify()

// Registrar o plugin fastify-cors para permitir todas as origens e métodos
app.register(cookie)
app.register(fastifyCors, {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
})

// Registrar suas rotas
app.register(mealsRoutes, { prefix: 'meals' })
app.register(authRoutes, { prefix: 'auth' })
app.register(usersRoutes, { prefix: 'users' })
app.register(metricsRoutes, { prefix: 'metrics' })
