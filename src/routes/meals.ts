import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { authenticate } from '../middlewares/authMiddleware'
import { authorize } from '../middlewares/authorizationMiddleware'

// todo plugin precisa sem async

//  tipagem do req principal => tem que ser feito por schema do knex para
// {
// 	title: string,
// 	amount: number,
// 	type: 'credit' | 'debit'
// }

// Cookies <=> formas de manter contexto entre requisições:
// @fastify/cookie

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: authenticate }, async (request, reply) => {
    const createMealsBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isInDiet: z.boolean(),
      calories: z.number(),
    })

    const { name, description, isInDiet, calories } =
      createMealsBodySchema.parse(request.body)

    try {
      const newMeal = await knex('meals')
        .insert({
          user_id: request.user.user.id,
          name,
          description,
          date_time: new Date().toLocaleString('en-US', {
            timeZone: 'America/Sao_Paulo', // Fuso horário de São Paulo (GMT-03)
          }),
          is_in_diet: isInDiet,
          calories,
        })
        .returning('*')

      reply.code(201).send({ created: newMeal })
    } catch (error) {
      console.error(error)
      reply.status(500).send({ error: 'Internal Server Error' })
    }
  })

  // Edita uma refeição existente
  app.put(
    '/:mealId',
    {
      preHandler: [authenticate, authorize],
      schema: { params: { mealId: { type: 'integer' } } },
    },
    async (request, reply) => {
      const mealsParamsSchema = z.object({
        mealId: z.number(),
      })

      const { mealId } = mealsParamsSchema.parse(request.params)

      const mealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isInDiet: z.boolean(),
        dateTime: z.string(),
        calories: z.number(),
      })

      const { name, description, dateTime, isInDiet, calories } =
        mealsBodySchema.parse(request.body)

      try {
        const [updatedRows] = await knex('meals')
          .where('id', mealId.toString())
          .update({
            name,
            description,
            date_time: dateTime,
            is_in_diet: isInDiet,
            calories,
          })
          .returning('*') // Retorna todos os campos da refeição após a atualização

        if (updatedRows) {
          reply.send({
            message: 'Meal updated successfully',
            updatedMeal: updatedRows,
          })
        } else {
          reply.status(404).send({ error: 'Meal not found' })
        }
      } catch (error) {
        console.error(error)
        reply.status(500).send({ error: 'Internal Server Error' })
      }
    },
  )

  // // Apaga uma refeição existente
  app.delete(
    '/:mealId',
    {
      preHandler: [authenticate, authorize],
      schema: { params: { mealId: { type: 'integer' } } },
    },
    async (request, reply) => {
      const mealsParamsSchema = z.object({
        mealId: z.number(),
      })

      const { mealId } = mealsParamsSchema.parse(request.params)

      try {
        const deletedRows = await knex('meals').where('id', mealId).del()

        console.log(deletedRows)
        if (deletedRows > 0) {
          reply.send({ message: 'Meal deleted successfully' })
        } else {
          reply.status(404).send({ error: 'Meal not found' })
        }
      } catch (error) {
        console.error(error)
        reply.status(500).send({ error: 'Internal Server Error' })
      }
    },
  )

  // Lista todas as refeições do usuário autenticado
  app.get('/', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.user.id

    console.log(request.user)

    try {
      const userMeals = await knex('meals').where({ user_id: userId })

      reply.send({ total: userMeals.length, userMeals })
    } catch (error) {
      console.error(error)
      reply.status(500).send({ error: 'Internal Server Error' })
    }
  })

  app.get('/all', async (request, reply) => {
    const mealsRegistred = await knex('meals').select('*')

    return {
      total: mealsRegistred.length,
      mealsRegistred,
    }
  })

  // Obtém detalhes de uma refeição específica
  app.get(
    '/:mealId',
    {
      preHandler: [authenticate, authorize],
      schema: { params: { mealId: { type: 'integer' } } },
    },
    async (request, reply) => {
      const mealsParamsSchema = z.object({
        mealId: z.number(),
      })

      const { mealId } = mealsParamsSchema.parse(request.params)

      try {
        const meal = await knex('meals').where('id', mealId).first()

        if (meal) {
          reply.send(meal)
        } else {
          reply.status(404).send({ error: 'Meal not found' })
        }
      } catch (error) {
        console.error(error)
        reply.status(500).send({ error: 'Internal Server Error' })
      }
    },
  )
}
