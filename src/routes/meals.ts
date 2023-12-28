import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import crypto, { randomUUID } from 'node:crypto'
import { knex } from '../database'
import {
  authenticate,
  authenticationMiddleware,
} from '../middlewares/authMiddleware'
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
  app.post('/meals', { preHandler: authenticate }, async (request, reply) => {
    const { name, description, date_time, is_in_diet } = request.body
    const user_id = request.user.id

    try {
      const newMeal = await knex('meals').insert({
        user_id,
        name,
        description,
        date_time,
        is_in_diet,
      })

      reply.code(201).send({ id: newMeal[0] })
    } catch (error) {
      console.error(error)
      reply.status(500).send({ error: 'Internal Server Error' })
    }
  })

  // Edita uma refeição existente
  app.put(
    '/meals/:id',
    {
      preHandler: [authenticate, authorize],
      schema: { params: { id: { type: 'integer' } } },
    },
    async (request, reply) => {
      const mealId = request.params.id
      const { name, description, date_time, is_in_diet } = request.body

      try {
        const updatedRows = await knex('meals')
          .where({ id: mealId })
          .update({ name, description, date_time, is_in_diet })

        if (updatedRows > 0) {
          reply.send({ message: 'Meal updated successfully' })
        } else {
          reply.status(404).send({ error: 'Meal not found' })
        }
      } catch (error) {
        console.error(error)
        reply.status(500).send({ error: 'Internal Server Error' })
      }
    },
  )

  // Apaga uma refeição existente
  app.delete(
    '/meals/:id',
    {
      preHandler: [authenticate, authorize],
      schema: { params: { id: { type: 'integer' } } },
    },
    async (request, reply) => {
      const mealId = request.params.id

      try {
        const deletedRows = await knex('meals').where({ id: mealId }).del()

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
  app.get('/meals', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id

    try {
      const userMeals = await knex('meals').where({ user_id: userId })

      reply.send(userMeals)
    } catch (error) {
      console.error(error)
      reply.status(500).send({ error: 'Internal Server Error' })
    }
  })

  // Obtém detalhes de uma refeição específica
  app.get(
    '/meals/:id',
    {
      preHandler: [authenticate, authorize],
      schema: { params: { id: { type: 'integer' } } },
    },
    async (request, reply) => {
      const mealId = request.params.id

      try {
        const meal = await knex('meals').where({ id: mealId }).first()

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
