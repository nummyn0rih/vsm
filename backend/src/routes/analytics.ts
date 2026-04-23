import { Router } from 'express';
import { getSummary, getTotal } from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getSummary);
router.get('/total', getTotal);

export default router;
