const client = require('../db.js');

console.log('client:', client);
module.exports = {

  queryTen: () => client.query('SELECT * FROM questions LIMIT 5')


}