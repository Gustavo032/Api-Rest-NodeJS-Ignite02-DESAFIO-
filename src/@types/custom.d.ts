import { FastifyRequest } from 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user: any
    userId: any
    params: {
      userId: any
    }
    userId: string // Ou qualquer tipo apropriado para o ID do usuário
  }
}
