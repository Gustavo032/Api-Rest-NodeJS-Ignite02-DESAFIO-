import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key' // Troque pelo segredo do seu JWT

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const token = request.cookies.token

  if (!token) {
    return reply.status(401).send({
      error: 'unauthorized',
    })
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY)
    request.user = decoded // Adiciona o usuário decodificado ao objeto de requisição
  } catch (error) {
    return reply.status(401).send({
      error: 'unauthorized',
    })
  }
}
