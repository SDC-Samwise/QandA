const express = require('express');
const client = require('./db.js');
const app = express();
const morgan = require('morgan');
const { rmSync } = require('fs');

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json())

app.get('/qa/questions/:question_id/answers', (req, res) => {
  let params = [];
  if (req.params.question_id) {
    params.push(req.params.question_id);
  }
  if (req.query.page) {
    params.push(req.query.page);
  } else {
    params.push(1);
  }
  if (req.query.count) {
    params.push(req.query.count);
  } else {
    params.push(1);
  }

  var getAnswers = `
    select az.*, COALESCE(json_agg(json_build_object('id', ap.id, 'url', ap.url))FILTER (WHERE ap.id IS NOT NULL), '[]') photos \
    from answers az \
    left join answers_photos ap on ap.answer_id=az.id where az.question_id = $1 \
    group by az.id limit $2 offset $3 \
    `;

  client.query(getAnswers, [req.params.question_id, 1, 0])
    .then(response => {
      res.status(200).json(response.rows);
    })
    .catch(err => res.status(404).json('bad request'))
});

app.put('/qa/answers/:answer_id/report', (req, res) => {
  var updateReportedQuery = `
    update answers az \
    set reported=1 \
    where az.id=$1 \
  `;
  client.query(updateReportedQuery, [req.params.answer_id])
    .then(response => {
      res.status(204).json('NO CONTENT');
    })
    .catch(err => res.status(404).json('bad request'))
});

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  var updateHelpfulQuery = `
    update answers az \
    set helpful=helpful + 1 \
    where az.id=$1 \
  `;
  client.query(updateHelpfulQuery, [req.params.answer_id])
    .then(response => {
      res.status(204).json('NO CONTENT');
    })
    .catch(err => res.status(404).json('bad request'))
});

app.put('/qa/questions/:question_id/report', (req, res) => {
  var updateReportedQuery = `
    update questions az \
    set reported=1 \
    where az.id=$1 \
  `;
  client.query(updateReportedQuery, [req.params.question_id])
    .then(response => {
      res.status(204).json('NO CONTENT');
    })
    .catch(err => res.status(404).json('bad request'))
});

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  var updateHelpfulQuery = `
    update questions qz \
    set helpful=helpful + 1 \
    where qz.id=$1 \
  `;
  client.query(updateHelpfulQuery, [req.params.question_id])
    .then(response => {
      res.status(204).json('NO CONTENT');
    })
    .catch(err => res.status(404).json('bad request'))
});

app.post('/qa/questions/:question_id/answers', (req, res) => {
  client.query('SELECT COUNT(*)+1 FROM answers')
    .then(response => {
      var id = Object.values(response.rows[0])[0];
      var photos = req.body.photos;
      delete req.body.photos;
      var params = [...Object.values(req.body), id, req.params.question_id, Date.now()];
      var insertAnswerQuery = `
        INSERT INTO answers( \
          body, answerer_name, answerer_email, id, question_id, date_written, reported, helpful) \
          VALUES ($1, $2, $3, $4, $5, $6,  0, 0) \
        `;
      client.query(insertAnswerQuery, params)
        .then(response => {
          if (photos.length > 0) {
            client.query('SELECT COUNT(*)+1 FROM answers_photos')
              .then(({ rows }) => {
                var photo_id = parseInt(Object.values(...rows)[0]);
                var insertPhotoQuery = `INSERT INTO public.answers_photos(id, answer_id, url) VALUES ($1, $2, $3)`;
                var asyncMap = function (photos) {
                  photos.forEach(async photo => {
                    await client.query(insertPhotoQuery, [photo_id += 1, id, photo])
                      .then(response => {
                        res.status(200).json('data uploaded');
                      })
                      .catch(err => console.log('Data'))
                  })
                }
                asyncMap(photos);
              })
          } else {
            res.status(200).json('else statement hit');
          }
        })
        .catch(err => res.status(404).json(err));
    })
});

app.post('/qa/questions', (req, res) => {
  client.query('SELECT COUNT(*)+1 FROM questions')
    .then(response => {
      var q_id = Object.values(response.rows[0])[0];
      var qParams = [q_id, ...Object.values(req.body), Date.now()]
      var insertQuestionQuery = `
      INSERT INTO questions( \
        id, body, asker_name, asker_email, product_id, date_written, reported, helpful) \
        VALUES ($1, $2, $3, $4, $5, $6,  0, 0) \
      `;
      client.query(insertQuestionQuery, qParams)
        .then(response => {
          res.status(200).json('Question updated');
        })
        .catch(err => console.log(err));
    })
});

app.get('/qa/questions', (req, res) => {
  let getQuestions = `
    (select   \
      json_agg(json_build_object(\
        'question_id', qs2.id , \
        'question_body', qs2.body, \
        'question_date', qs2.date_written, \
        'asker_name', qs2.asker_name, \
        'question_helpfulness', qs2.helpful, \
        'reported', qs2.reported,\
          'answers',COALESCE((qs2.answers), '{}')\
    )) results\
    from\
    (select qs.*, (select json_object_agg(\
    pho.id, json_build_object(\
      'id', pho.id,\
      'body', pho.body,\
      'answerer_name', pho.answerer_name,\
      'helpfulness', pho.helpful,\
      'photos', pho.photos\
    )\
    ) az3 from\
    (select az.*, COALESCE(json_agg(json_build_object('id', ap.id, 'url', ap.url))FILTER (WHERE ap.id IS NOT NULL), '[]') photos \
    from answers_photos ap \
    left join answers az on ap.answer_id=az.id where az.question_id = qs.id\
    group by az.id) pho group by pho.question_id) answers from questions qs where qs.product_id=$1 limit $2 offset $3) qs2)\
  `;

  var limit = req.query.count || 5;
  var offset = req.query.page || 1;
  client.query(getQuestions, [req.query.product_id, limit, offset])
    .then(response => {
      response.rows[0].product_id = req.query.product_id;
      res.status(200).json(response.rows[0]);
    })
    .catch(err => console.log(err));
});

app.listen(3000);
client.connect();