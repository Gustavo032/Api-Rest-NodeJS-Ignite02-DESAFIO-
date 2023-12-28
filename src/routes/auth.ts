import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import jwt from 'jsonwebtoken'

// todo plugin precisa sem async

//  tipagem do req principal => tem que ser feito por schema do knex para
// {
// 	title: string,
// 	amount: number,
// 	type: 'credit' | 'debit'
// }

// Cookies <=> formas de manter contexto entre requisições:
// @fastify/cookie

export async function authRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request, reply) => {
    console.log(`[${request.method}] ${request.url}`)
  })
  app.post('/', async (request, reply) => {
    const loginBodySchema = z.object({
      name: z.string(),
      jwtoken: z.string(),
      email: z.string(),
    })

    const { name, jwtoken, email } = loginBodySchema.parse(request.body)
    // vai ir lá no banco de dados e ver o temp que bate com o jwt enviado (se existir)
    // substituir pela variavel ambiente .env
    const secretKey = '99698035'

    const user = await knex('users').where('email', email).first()
    console.log(user)
    if (!user) {
      // Usuário não encontrado
      reply
        .status(401)
        .send({ success: false, message: 'Credenciais inválidas' })

      return { success: false, message: 'Credenciais inválidas' }
    }

    // Verifica se o token é válido e não expirou
    jwt.verify(jwtoken, secretKey, (error: any, decoded: any) => {
      if (error) {
        if (error.name === 'TokenExpiredError') {
          console.log('Token expirado')
          reply.status(401).send({ succes: false, message: 'Token expirado' })
        } else {
          reply.status(401).send({
            succes: false,
            message: 'Erro ao verificar o token: ' + error.message,
          })
          console.error('Erro ao verificar o token: ', error.message)
        }
      } else {
        console.log('Token válido:', decoded)
        // Aqui, `decoded` contém o payload do token
        console.log(decoded)
      }
    })

    // procura o email e jwt correspondente
    const authenticated = await knex('users')
      .where('email', email)
      .where('temp_if_login', jwtoken)
      .returning('*')
    console.log(authenticated)

    if (authenticated.length > 0) {
      const chaveSecreta = '99698035'

      // Informações que você deseja incluir no token
      const payload = {
        usuarioId: name + randomUUID(),
        nome: name,
        papel: 'user',
      }

      // Configurações do token, como algoritmo de assinatura e tempo de expiração
      const opcoes: jwt.SignOptions = {
        algorithm: 'HS256', // Algoritmo de assinatura HMAC SHA-256
        expiresIn: '1h', // Tempo de expiração do token (pode ser em segundos, minutos, horas, dias, etc.)
      }

      // Criação do token
      const token = jwt.sign(payload, chaveSecreta, opcoes)

      await knex('users')
        .where('email', email)
        .first()
        .update('temp_if_login', token)

      reply.status(200).send({
        succes: true,
        message: 'Token válido: ',
        newToken: token,
      })
    } else {
      reply.status(401).send({ error: 'Credenciais inválidas' })
    }
  })
}
