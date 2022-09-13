import { Router } from 'express';

import { createQuestion } from '../controllers/questions';

const router = Router();

router.get('/:product_id/:page/:count');  // List Questions

router.post('/', createQuestion);  // Add a question

router.put('/:question_id/helpful');  // Mark Question as Helpful

router.put('/:question_id/report');  // Report Question

router.get('/:question_id/answers');  // Answers List

router.post('/:question_id/answers');  // Add an Answer

export default router;