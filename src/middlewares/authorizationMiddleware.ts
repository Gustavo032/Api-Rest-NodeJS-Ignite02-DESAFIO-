import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function authorize(request: FastifyRequest, reply: FastifyReply) {
  const mealsParamsSchema = z.object({
    mealId: z.union([z.string(), z.number()]),
  })
  const { mealId } = mealsParamsSchema.parse(request.params)

  const userIdFromToken = request.user.user.id // Assumindo que o token JWT contém o ID do usuário

  // Recupera o usuário associado à refeição
  const meal = await knex('meals').where('id', mealId.toString()).first()

  console.log(meal?.user_id + ' refeiçãooooooooooo')
  if (!meal) {
    // A refeição não existe
    return reply.status(404).send({
      error: 'not found',
    })
  }
  console.log(userIdFromToken)
  if (userIdFromToken !== meal.user_id) {
    // O usuário não tem permissão para acessar esta refeição
    return reply.status(403).send({
      error: 'forbidden',
    })
  }
}
