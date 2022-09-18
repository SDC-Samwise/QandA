var controller = require('../controllers');
const router = require('express').Router();

router.post('/', controller.questions.addQuestion);  // Add a question

router.get('/:product_id/:page/:count', controller.questions.listQuestions);  // List Questions

router.put('/:question_id/helpful', controller.questions.helpful);  // Mark Question as Helpful

router.put('/:question_id/report', controller.questions.report);  // Report Question

router.get('/:question_id/answers', controller.questions.listAnswers);  // Answers List

router.post('/:question_id/answers', controller.questions.addAnswer);  // Add an Answer

module.exports = router;