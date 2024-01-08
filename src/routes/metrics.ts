import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { authenticate } from '../middlewares/authMiddleware'

export async function metricsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.user.id

      // Obtém a quantidade total de refeições do usuário
      const totalMealsResult = await knex('meals')
        .where({ user_id: userId })
        .count()
        .first()

      // Obtém a quantidade de refeições dentro da dieta do usuário
      const dietMealsResult = await knex('meals')
        .where({ user_id: userId, is_in_diet: true })
        .count()
        .first()

      // Obtém a quantidade de refeições fora da dieta do usuário
      const nonDietMealsResult = await knex('meals')
        .where({ user_id: userId, is_in_diet: false })
        .count()
        .first()

      // Obtém a melhor sequência de refeições dentro da dieta (exemplo: últimas 5 refeições)
      const bestDietSequence = await knex('meals')
        .select(['id', 'name', 'description', 'date_time', 'calories'])
        .where({ user_id: userId, is_in_diet: true })
        .sum({ totalCalories: 'calories' }) // Calcula a soma de 'calories' e renomeia para 'totalCalories'
        .groupBy('id', 'name', 'description', 'date_time')
        .orderBy('totalCalories', 'desc') // Ordena pelo total de calorias
        .limit(5)

      // Verifica se os resultados estão definidos antes de acessar as propriedades
      const metrics = {
        totalMeals: totalMealsResult?.['count(*)'] || 0,
        dietMeals: dietMealsResult?.['count(*)'] || 0,
        nonDietMeals: nonDietMealsResult?.['count(*)'] || 0,
        bestDietSequence: bestDietSequence.map((meal: any) => ({
          id: meal.id,
          name: meal.name,
          description: meal.description,
          date_time: meal.date_time,
          calories: meal.calories,
        })),
      }

      reply.send(metrics)
    } catch (error) {
      console.error(error)
      reply.status(500).send({ error: 'Internal Server Error' })
    }
  })

  // Adicione outras rotas conforme necessário...
}
