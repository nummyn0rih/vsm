import { Router } from 'express';
import { getLogs } from '../controllers/logController';
import { authMiddleware } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleCheck';

const router = Router();

router.use(authMiddleware);
router.get('/', requireAdmin, getLogs);

export default router;