const client = require('../db.js');

module.exports = {

  queryTen: () => client.query('SELECT * FROM questions LIMIT 5')


}