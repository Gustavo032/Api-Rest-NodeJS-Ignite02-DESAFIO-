import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import jwt from 'jsonwebtoken'
import { authenticate } from '../middlewares/authMiddleware'

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
  app.post('/', { preHandler: authenticate }, async (request, reply) => {
    const loginBodySchema = z.object({
      name: z.string(),
      jwtoken: z.string().default(() => request.cookies.token ?? ''),
      email: z.string(),
    })

    const { jwtoken, email } = loginBodySchema.parse(request.body)

    const jwtokens = jwtoken

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
    jwt.verify(jwtokens, secretKey, (error: any, decoded: any) => {
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
      .where('temp_if_login', jwtokens)
      .returning('*')

    console.log(authenticated)

    if (authenticated.length > 0) {
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
        expiresIn: '3600000', // Tempo de expiração do token (pode ser em segundos, minutos, horas, dias, etc.)
      }

      // Criação do token
      const token = jwt.sign(payload, chaveSecreta, opcoes)

      await knex('users')
        .where('email', email)
        .first()
        .update('temp_if_login', token)

      reply.setCookie('token', token, {
        httpOnly: true, // O cookie só pode ser acessado pelo servidor (não por scripts no navegador)
        secure: process.env.NODE_ENV === 'production', // Apenas enviar em conexões seguras (HTTPS) em produção
        path: '/', // Define o caminho do cookie (pode ser ajustado conforme necessário)
        expires: new Date(Number(opcoes.expiresIn) + Date.now()), // Define a data de expiração com 1 hora
      })

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
