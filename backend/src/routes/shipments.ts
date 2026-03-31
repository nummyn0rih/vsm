import { Router } from 'express';
import {
  getShipments,
  getShipment,
  createShipment,
  updateShipment,
  updateShipmentStatus,
  deleteShipment,
} from '../controllers/shipmentController';
import { authMiddleware } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleCheck';

const router = Router();

router.use(authMiddleware);

router.get('/', getShipments);
router.get('/:id', getShipment);
router.post('/', requireAdmin, createShipment);
router.put('/:id', requireAdmin, updateShipment);
router.patch('/:id/status', requireAdmin, updateShipmentStatus);
router.delete('/:id', requireAdmin, deleteShipment);

export default router;