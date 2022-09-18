const express = require('express');
const client = require('./db.js');
const app = express();
const morgan = require('morgan');
const Router = require('express');
const qRouter = require('./routes/questions.js');
const aRouter = require('./routes/answers.js');

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json())

app.use('/qa/questions', qRouter);
app.use('/qa/answers', aRouter);

app.listen(3000);
client.connect();