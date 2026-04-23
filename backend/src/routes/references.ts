import { Router } from 'express';
import {
  getVegetables, createVegetable, updateVegetable, deleteVegetable,
  getSuppliers, createSupplier, updateSupplier, deleteSupplier,
  getTransportCompanies, createTransportCompany, updateTransportCompany, deleteTransportCompany,
  getDrivers, createDriver, updateDriver, deleteDriver,
} from '../controllers/referenceController';
import {
  getContracts, createContract, updateContract, deleteContract,
  contractValidation,
} from '../controllers/contractController';
import { authMiddleware } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleCheck';

const router = Router();

router.use(authMiddleware);

// Овощи
router.get('/vegetables', getVegetables);
router.post('/vegetables', requireAdmin, createVegetable);
router.put('/vegetables/:id', requireAdmin, updateVegetable);
router.delete('/vegetables/:id', requireAdmin, deleteVegetable);

// Поставщики
router.get('/suppliers', getSuppliers);
router.post('/suppliers', requireAdmin, createSupplier);
router.put('/suppliers/:id', requireAdmin, updateSupplier);
router.delete('/suppliers/:id', requireAdmin, deleteSupplier);

// Транспортные компании
router.get('/transport-companies', getTransportCompanies);
router.post('/transport-companies', requireAdmin, createTransportCompany);
router.put('/transport-companies/:id', requireAdmin, updateTransportCompany);
router.delete('/transport-companies/:id', requireAdmin, deleteTransportCompany);

// Водители
router.get('/drivers', getDrivers);
router.post('/drivers', requireAdmin, createDriver);
router.put('/drivers/:id', requireAdmin, updateDriver);
router.delete('/drivers/:id', requireAdmin, deleteDriver);

// Контракты
router.get('/contracts', getContracts);
router.post('/contracts', requireAdmin, contractValidation, createContract);
router.put('/contracts/:id', requireAdmin, contractValidation, updateContract);
router.delete('/contracts/:id', requireAdmin, deleteContract);

export default router;