var QA = require('../models');

module.exports = {
  listQuestions: (req, res) => {
    var limit = req.params.count || 5;
    var offset = req.params.page || 1;
    QA.questions.questions([req.params.product_id, limit, offset])
      .then(response => {
        response.rows[0].product_id = req.params.product_id;
        res.status(200).json(response.rows[0]);
      })
      .catch(err => console.log(err));
  },
  listAnswers: (req, res) => {
    QA.questions.answers([req.params.question_id, req.query.page || 1, req.query.count || 5])
      .then(response => {
        res.status(200).json(response.rows);
      })
      .catch(err => res.status(404).json('bad request'))
  },
  report: (req, res) => {
    QA.questions.reportQuestion([req.params.question_id])
      .then(response => {
        res.status(204).json('NO CONTENT');
      })
      .catch(err => res.status(404).json('bad request'))
  },
  helpful: (req, res) => {
    QA.questions.helpfulQuestion([req.params.question_id])
      .then(response => {
        res.status(204).json('NO CONTENT');
      })
      .catch(err => res.status(404).json('bad request'))
  },
  addQuestion: (req, res) => {
    QA.questions.getQuestionCount()
      .then(response => {
        var q_id = Object.values(response.rows[0])[0];
        var qParams = [q_id, ...Object.values(req.body), Date.now()]
        QA.questions.addQuestion(qParams)
          .then(response => {
            res.status(200).json('Question updated');
          })
          .catch(err => console.log(err));
      })
  },
  addAnswer: (req, res) => {
    QA.questions.getAnswerCount()
      .then(response => {
        var id = Object.values(response.rows[0])[0];
        var photos = req.body.photos;
        delete req.body.photos;
        var params = [...Object.values(req.body), id, req.params.question_id, Date.now()];
        QA.questions.insertAnswer(params)
          .then(response => {
            if (photos.length > 0) {
              QA.questions.getPhotoCount()
                .then(({ rows }) => {
                  var photo_id = parseInt(Object.values(...rows)[0]);
                  var asyncMap = function (photos) {
                    photos.forEach(async photo => {
                      await QA.questions.insertPhoto([photo_id += 1, id, photo])
                        .then(response => {
                          res.status(200).json('Data uploaded');
                        })
                        .catch(err => res.status(200))
                    })
                  }
                  asyncMap(photos);
                })
            } else {
              res.status(200).json('Data uploaded');
            }
          })
          .catch(err => res.status(404).json(err));
      })
  }
};