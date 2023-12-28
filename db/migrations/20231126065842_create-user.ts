import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().notNullable()
    table.text('name').unique().notNullable()
    table.text('email').unique().notNullable()
    table.text('password').notNullable()
    table.text('salt').notNullable()
    // temp vai ser um UUID + timestamp que ele vai espirar
    table.text('temp_if_login').unique()
    table.timestamp('created_at').notNullable()
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
}
