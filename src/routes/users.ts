import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import crypto from 'node:crypto'
import { knex } from '../database'

// lslint:disable-next-line no-unused-vars
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

export async function usersRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request, reply) => {
    console.log(`[${request.method}] ${request.url}`)
  })
  app.post('/', async (request, reply) => {
    // validação dos dados vindo da req
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    // é tipo uma desestruturação usando a validação schema do zod
    const { name, email, password } = createUserBodySchema.parse(request.body)

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

    const userCreated = await knex('users')
      .insert({
        id: crypto.randomUUID(),
        name,
        email,
        salt,
        password: hashedUserInputPassword,
        created_at: String(new Date()),
      })
      .returning('*')

    // bom retornar sempre como objeto-- melhor pra adicionar e modificar informações futuramente
    return {
      total: userCreated.length,
      created: userCreated,
    }
  })

  app.post('/login', async (request, reply) => {
    // validação dos dados vindo da req
    const loginBodySchema = z.object({
      email: z.string(),
      password: z.string(),
    })

    const { email, password } = loginBodySchema.parse(request.body)

    function hashPassword(password: string, salt: string) {
      const hash = crypto.createHash('sha256')
      hash.update(password + salt)
      const hashedPassword = hash.digest('hex')
      return hashedPassword
    }

    const user = await knex('users').where('email', email).first()

    if (!user) {
      // Usuário não encontrado
      reply
        .status(401)
        .send({ success: false, message: 'Credenciais inválidas' })

      return { success: false, message: 'Credenciais inválidas' }
    }

    const hashedLoginPassword = hashPassword(password, user.salt)

    const login = await knex('users')
      .where('email', email)
      .andWhere('password', hashedLoginPassword)
      .returning('*')

    console.log(login)
    console.log(hashedLoginPassword)

    if (login.length > 0) {
      console.log('Login deu certoooo!!!' + login)
      const chaveSecreta = '99698035'

      // Informações que você deseja incluir no token
      const payload = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          salt: user.salt,
          created_at: user.created_at,
          // Adicione outros campos, se necessário
        },
      }
      // Configurações do token, como algoritmo de assinatura e tempo de expiração
      const opcoes: jwt.SignOptions = {
        algorithm: 'HS256', // Algoritmo de assinatura HMAC SHA-256
        expiresIn: '7200000', // Tempo de expiração do token (pode ser em segundos, minutos, horas, dias, etc.)
      }

      // Criação do token
      const token = jwt.sign(payload, chaveSecreta, opcoes)

      console.log('Token JWT:', token)

      await knex('users').where('email', email).update('temp_if_login', token)

      reply.setCookie('token', token, {
        httpOnly: true, // O cookie só pode ser acessado pelo servidor (não por scripts no navegador)
        secure: process.env.NODE_ENV === 'production', // Apenas enviar em conexões seguras (HTTPS) em produção
        path: '/', // Define o caminho do cookie (pode ser ajustado conforme necessário)
        expires: new Date(Number(opcoes.expiresIn) + Date.now()), // Define a data de expiração com 1 hora
      })

      reply.send({ status: 'success', newToken: token })
    } else {
      reply
        .status(401)
        .send({ success: false, message: 'Credenciais inválidas' })
      console.log('Login failed' + login)
    }
  })

  app.get('/all', async (request, reply) => {
    const usersRegistred = await knex('users').select('*')

    return {
      total: usersRegistred.length,
      usersRegistred,
    }
  })
}
