const express = require('express');
const client = require('./db.js');
const app = express();
const morgan = require('morgan');

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

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

app.get('/qa/questions/:question_id/answers', (req, res) => {
  let params = [];
  let queryValues = [];
  let getAnswers = `SELECT * FROM answers WHERE question_id=$1`;

  if (req.query.page) {
    queryValues.push(req.query.page);
  } else {
    queryValues.push(1);
  }

  if (req.query.count) {
    queryValues.push(req.query.count);
  } else {
    queryValues.push(1);
  }

  client.query(getAnswers, [req.params.question_id])
    .then(response => {
      res.status(200).json(response.rows);
    })

});


app.listen(3000);
client.connect();