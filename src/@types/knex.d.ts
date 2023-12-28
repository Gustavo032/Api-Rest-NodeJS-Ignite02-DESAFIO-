// definição de tipos .d.ts
// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      password: string
      salt: string
      temp_if_login: string
      created_at: string
    }
    meals: {
      id: string
      user_id: string
      name: string
      description: string
      date_time: string
      is_in_diet: boolean
    }
  }
}
