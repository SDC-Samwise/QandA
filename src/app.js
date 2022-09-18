const express = require('express');
const client = require('./db.js');
const app = express();
const morgan = require('morgan');
const { rmSync } = require('fs');
const Router = require('express');
const qRouter = require('./routes/questions.js');
const aRouter = require('./routes/answers.js');

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json())

app.use('/qa/questions', qRouter);
app.use('/qa/answers', aRouter);

// app.post('/questions', (req, res) => {
//   client.query('SELECT COUNT(*)+1 FROM questions')
//     .then(response => {
//       var q_id = Object.values(response.rows[0])[0];
//       var qParams = [q_id, ...Object.values(req.body), Date.now()]
//       var insertQuestionQuery = `
//       INSERT INTO questions( \
//         id, body, asker_name, asker_email, product_id, date_written, reported, helpful) \
//         VALUES ($1, $2, $3, $4, $5, $6,  0, 0) \
//       `;
//       client.query(insertQuestionQuery, qParams)
//         .then(response => {
//           res.status(200).json('Question updated');
//         })
//         .catch(err => console.log(err));
//     })
// });


app.listen(3000);
client.connect();