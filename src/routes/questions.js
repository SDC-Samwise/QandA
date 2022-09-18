var controller = require('../controllers');
const router = require('express').Router();

router.post('/', controller.questions.addQuestion);

router.get('/:product_id/:page/:count', controller.questions.listQuestions);

router.put('/:question_id/helpful', controller.questions.helpful);

router.put('/:question_id/report', controller.questions.report);

router.get('/:question_id/answers', controller.questions.listAnswers);

router.post('/:question_id/answers', controller.questions.addAnswer);

module.exports = router;