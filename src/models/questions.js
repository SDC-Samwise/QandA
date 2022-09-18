const client = require('../db');

module.exports = {
  questions: (params) => {
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
    return client.query(getQuestions, params);
  },
  answers: (params) => {
    var getAnswers = `
      select az.*, COALESCE(json_agg(json_build_object('id', ap.id, 'url', ap.url))FILTER (WHERE ap.id IS NOT NULL), '[]') photos \
      from answers az \
      left join answers_photos ap on ap.answer_id=az.id where az.question_id = $1 \
      group by az.id offset $2 limit $3 \
      `;
    return client.query(getAnswers, params)
  },
  reportQuestion: (params) => {
    var updateReportedQuery = `
      update questions az \
      set reported=1 \
      where az.id=$1 \
    `;
    return client.query(updateReportedQuery, params)
  },
  helpfulQuestion: (params) => {
    var updateHelpfulQuery = `
      update questions qz \
      set helpful=helpful + 1 \
      where qz.id=$1 \
    `;
    return client.query(updateHelpfulQuery, params)
  },
  addQuestion: (params) => {
    var insertQuestionQuery = `
        INSERT INTO questions( \
          id, body, asker_name, asker_email, product_id, date_written, reported, helpful) \
          VALUES ($1, $2, $3, $4, $5, $6,  0, 0) \
        `;
    return client.query(insertQuestionQuery, params)
  },
  getQuestionCount: () => {
    return client.query('SELECT COUNT(*)+1 FROM questions')
  },
  getAnswerCount: () => {
    return client.query('SELECT COUNT(*)+1 FROM answers')
  },
  insertAnswer: (params) => {
    var insertAnswerQuery = `
        INSERT INTO answers( \
          body, answerer_name, answerer_email, id, question_id, date_written, reported, helpful) \
          VALUES ($1, $2, $3, $4, $5, $6,  0, 0) \
        `;
    return client.query(insertAnswerQuery, params)
  },
  getPhotoCount: () => {
    return client.query('SELECT COUNT(*)+1 FROM answers_photos')
  },
  insertPhoto: (params) => {
    var insertPhotoQuery = `INSERT INTO public.answers_photos(id, answer_id, url) VALUES ($1, $2, $3)`;
    return client.query(insertPhotoQuery, params)
  }
};