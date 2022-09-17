var models = require('../models/questions');

console.log('controller.models:', models);
module.exports = {
  get: function (req, res) {
    models.queryTen()
      .then(result => {
        res.status(200).send(result);
      })
  }
}