const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  user: 'postgres',
  port: 5432,
  password: 'secret',
  database: 'samwise-qa-db'
})

module.exports = client;