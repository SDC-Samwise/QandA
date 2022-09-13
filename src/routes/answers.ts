import { Router } from 'express';

const router = Router();

router.put('/:answer_id/helpful');  // Mark Answer as Helpful

router.put('/:answer_id/report');  // Report Answer

export default router;