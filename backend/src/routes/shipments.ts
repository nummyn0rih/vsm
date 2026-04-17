import { Router } from 'express';
import {
  getShipments,
  getShipment,
  createShipment,
  updateShipment,
  updateShipmentStatus,
  deleteShipment,
  shipmentValidation,
} from '../controllers/shipmentController';
import { authMiddleware } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleCheck';

const router = Router();

router.use(authMiddleware);

router.get('/', getShipments);
router.get('/:id', getShipment);
router.post('/', requireAdmin, shipmentValidation, createShipment);
router.put('/:id', requireAdmin, shipmentValidation, updateShipment);
router.patch('/:id/status', requireAdmin, updateShipmentStatus);
router.delete('/:id', requireAdmin, deleteShipment);

export default router;
