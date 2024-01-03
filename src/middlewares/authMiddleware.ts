import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const SECRET_KEY = '99698035' // Troque pelo segredo do seu JWT

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const token = request.cookies.token

  console.log('token asedalwhselkajs')

  if (request.url !== '/auth') {
    if (!token) {
      console.error(' Token Undetermined')

      return reply.status(401).send({
        error: 'unauthorized',
      })
    }

    console.error(' token certinhoooooooo ')

    try {
      const decoded = jwt.verify(token, SECRET_KEY)
      request.user = decoded // Adiciona o usuário decodificado ao objeto de requisição
    } catch (error) {
      return reply.status(401).send({
        error: 'unauthorized',
      })
    }
  }
}
