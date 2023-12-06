import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import crypto, { randomUUID } from 'node:crypto'
import { knex } from '../database'

// todo plugin precisa sem async

//  tipagem do req principal => tem que ser feito por schema do knex para
// {
// 	title: string,
// 	amount: number,
// 	type: 'credit' | 'debit'
// }

// Cookies <=> formas de manter contexto entre requisições:
// @fastify/cookie

export async function usersRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request, reply) => {
    console.log(`[${request.method}] ${request.url}`)
  })
  app.post('/create', async (request, reply) => {
    // validação dos dados vindo da req
    const createTransactionBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    // é tipo uma desestruturação usando a validação schema do zod
    const { name, email, password } = createTransactionBodySchema.parse(
      request.body,
    )

    function hashPassword(password: string, salt: string) {
      const hash = crypto.createHash('sha256')
      hash.update(password + salt)
      const hashedPassword = hash.digest('hex')
      return hashedPassword
    }

    function generateSalt() {
      return crypto.randomBytes(16).toString('hex')
    }

    const salt = generateSalt()
    const hashedUserInputPassword = hashPassword(password, salt)

    const paths = await knex('users')
      .insert({
        name,
        email,
        password: hashedUserInputPassword,
      })
      .returning('*')

    // bom retornar sempre como objeto-- melhor pra adicionar e modificar informações futuramente
    return {
      total: paths.length,
      created: paths,
      next: randomUUID(),
    }
  })
}
