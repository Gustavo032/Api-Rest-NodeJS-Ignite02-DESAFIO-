import { FastifyRequest, FastifyReply } from 'fastify'

export async function authorize(
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply,
) {
  const userIdFromToken = request.user?.id // Assumindo que o token JWT contém o ID do usuário
  const userIdFromRoute = parseInt(request.params.userId, 10) // Assumindo que o ID do usuário está na rota

  if (userIdFromToken !== userIdFromRoute) {
    return reply.status(403).send({
      error: 'forbidden',
    })
  }
}
