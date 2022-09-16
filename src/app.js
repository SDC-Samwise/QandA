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

// TODO: FIX ME
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
      console.log('params:', params);
      client.query(insertAnswerQuery, params)
          .then(response => {
            var insertPhotoQuery = `
              INSERT INTO public.answers_photos( \
                id, answer_id, url) \
                VALUES ($1, $2, $3) \
              `;
            // client.query(insertPhotoQuery, [?, params[3], "first url"])

          })
          .catch(err => res.status(404).json(err));
    })
});

// TODO: FIX ME
app.post('/qa/questions', (req, res) => {

});

// TODO: FIX ME
app.get('/qa/questions', (req, res) => {
  let getQuery = `SELECT * FROM questions WHERE product_id = $1 LIMIT $2`;
  var params = [];
  if (req.query.product_id) {
    params.push(req.query.product_id);
  }
  if (req.query.count) {
    params.push(req.query.count);
  } else {
    params.push(5);
  }

  client.query(getQuery, params)
    .then(result => {
      res.status(200).json(result.rows);
    })
  client.end;
});

app.listen(3000);
client.connect();