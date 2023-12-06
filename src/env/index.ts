import { config } from 'dotenv'
import { z } from 'zod'

// process.env
if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

// schema == formato de dado
// temos o yup, zod, joi
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
  DATABASE_PATH: z.string(),
  PORT: z.coerce.number().default(3333),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('invalid environment variable!', _env.error.format())

  throw new Error('invalid environment variable')
}
// restante vai continuar executando

export const env = _env.data
