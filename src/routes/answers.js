var controller = require('../controllers');
const router = require('express').Router();

router.put('/:answer_id/helpful', controller.answers.helpful);  // Mark Answer as Helpful

router.put('/:answer_id/report', controller.answers.reported);  // Report Answer

module.exports = router;