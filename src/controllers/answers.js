var Ans = require('../models/answers.js');

module.exports = {
  helpful: function (req, res) {
    Ans.reportHelpful([req.params.answer_id])
      .then(response => {
        res.status(204).json('NO CONTENT');
      })
      .catch(err => res.status(404).json('bad request'))
  },
  reported: function (req, res) {
    Ans.reportReported([req.params.answer_id])
      .then(response => {
        res.status(204).json('NO CONTENT');
      })
      .catch(err => res.status(404).json('bad request'))
  }
};