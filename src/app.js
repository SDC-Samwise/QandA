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
      client.query(insertAnswerQuery, params)
        .then(response => {
          console.log('test')
          console.log('photos:', photos);


          // TODO: ONLY SEND THIS WHEN NO PHOTOS
          // TODO: OTHERWISE DO ANOTHER REQUEST TO SEND PHOTOS
          res.status(201).json('answer added successfully');
            // client.query('SELECT COUNT(*) FROM answers_photos')
            //   .then(({rows}) => {
            //     var currentCount = Object.values(...rows)[0];

            //   })
        })
        .catch(err => res.status(404).json(err));
    })
});

// TODO: FIX ME
app.post('/qa/questions', (req, res) => {


});

// TODO: FIX ME
app.get('/qa/questions', (req, res) => {
  let getQuestions = `
  select qs.product_id as product_id, json_agg(json_build_object( \
    'question_id', qs.id, \
    'question_body', qs.body, \
    'question_date', qs.date_written, \
    'asker_name', qs.asker_name, \
    'question_email', qs.asker_email, \
    'question_helpfulness', qs.helpful, \
    'reported', qs.reported)) results \
    from questions qs \
  left join answers az on qs.id=az.question_id \
  left join answers_photos ap on ap.answer_id=az.id \
  where qs.product_id=$1 \
  group by qs.product_id, az.id \
  `;
  console.log('req.params:', req.query)
  client.query(getQuestions, [req.query.product_id])
    .then(response => {
      console.log('response.rows:', response.rows);
      res.status(200).json(response.rows);
    })
    .catch(err => console.log(err));
});

app.listen(3000);
client.connect();


   // TODO: INSERT INTO PHOTOS *********************************
  //  console.log('photos:', photos);
  //  var insertPhotoQuery = `
  //    INSERT INTO public.answers_photos( \
  //      id, answer_id, url) \
  //      VALUES ($1, $2, $3) \
  //    `;
  //  // client.query(insertPhotoQuery, [?, params[3], "first url"])
  //  var asyncMap = function (photos) {
  //    var promises = photos.map((photo, index) => new Promise(client.query(`
  //      INSERT INTO answers_photos(id, answer_id, url) \
  //        VALUES ($1, $2, $3)`, [index, params[3], photo]))
  //    )

  //    return Promise.all(promises)
  //      .then(response => {
  //        console.log('response from bulk photo upload:', response);
  //        res.status(201).json('upload successful');
  //      })
  //      .catch(err => console.log(err))
  //  }
  //  asyncMap(photos);
   // TODO: INSERT INTO PHOTOS *********************************