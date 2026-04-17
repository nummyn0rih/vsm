import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createAuditLog } from '../services/logService';

// === ОВОЩИ ===
export async function getVegetables(req: Request, res: Response): Promise<void> {
  try {
    const vegetables = await prisma.vegetable.findMany({ orderBy: { name: 'asc' } });
    res.json(vegetables);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении списка овощей' });
  }
}

export async function createVegetable(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.body;
    const vegetable = await prisma.vegetable.create({ data: { name } });

    await createAuditLog({
      action: 'CREATE',
      entityType: 'vegetable',
      entityId: vegetable.id,
      newValues: vegetable,
      userId: req.user!.userId,
    });

    res.status(201).json(vegetable);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Такой овощ уже существует' });
      return;
    }
    res.status(500).json({ error: 'Ошибка при создании овоща' });
  }
}

export async function updateVegetable(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const vegetable = await prisma.vegetable.update({
      where: { id: parseInt(id) },
      data: { name },
    });

    await createAuditLog({
      action: 'UPDATE',
      entityType: 'vegetable',
      entityId: vegetable.id,
      newValues: vegetable,
      userId: req.user!.userId,
    });

    res.json(vegetable);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении овоща' });
  }
}

export async function deleteVegetable(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const entityId = parseInt(id);

    const usedInShipments = await prisma.shipment.count({
      where: { vegetableId: entityId, deletedAt: null },
    });

    if (usedInShipments > 0) {
      res.status(400).json({ error: 'Невозможно удалить: овощ используется в поставках' });
      return;
    }

    await prisma.vegetable.delete({ where: { id: entityId } });

    await createAuditLog({
      action: 'DELETE',
      entityType: 'vegetable',
      entityId,
      userId: req.user!.userId,
    });

    res.json({ message: 'Овощ удалён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении овоща' });
  }
}

// === ПОСТАВЩИКИ ===
export async function getSuppliers(req: Request, res: Response): Promise<void> {
  try {
    const suppliers = await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении списка поставщиков' });
  }
}

export async function createSupplier(req: Request, res: Response): Promise<void> {
  try {
    const { name, contactInfo } = req.body;
    const supplier = await prisma.supplier.create({ data: { name, contactInfo } });

    await createAuditLog({
      action: 'CREATE',
      entityType: 'supplier',
      entityId: supplier.id,
      newValues: supplier,
      userId: req.user!.userId,
    });

    res.status(201).json(supplier);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Такой поставщик уже существует' });
      return;
    }
    res.status(500).json({ error: 'Ошибка при создании поставщика' });
  }
}

export async function updateSupplier(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, contactInfo } = req.body;
    const supplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: { name, contactInfo },
    });

    await createAuditLog({
      action: 'UPDATE',
      entityType: 'supplier',
      entityId: supplier.id,
      newValues: supplier,
      userId: req.user!.userId,
    });

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении поставщика' });
  }
}

export async function deleteSupplier(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const entityId = parseInt(id);

    const usedInShipments = await prisma.shipment.count({
      where: { supplierId: entityId, deletedAt: null },
    });

    if (usedInShipments > 0) {
      res.status(400).json({ error: 'Невозможно удалить: поставщик используется в поставках' });
      return;
    }

    await prisma.supplier.delete({ where: { id: entityId } });

    await createAuditLog({
      action: 'DELETE',
      entityType: 'supplier',
      entityId,
      userId: req.user!.userId,
    });

    res.json({ message: 'Поставщик удалён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении поставщика' });
  }
}

// === ТРАНСПОРТНЫЕ КОМПАНИИ ===
export async function getTransportCompanies(req: Request, res: Response): Promise<void> {
  try {
    const companies = await prisma.transportCompany.findMany({ orderBy: { name: 'asc' } });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении списка транспортных компаний' });
  }
}

export async function createTransportCompany(req: Request, res: Response): Promise<void> {
  try {
    const { name, contactInfo } = req.body;
    const company = await prisma.transportCompany.create({ data: { name, contactInfo } });

    await createAuditLog({
      action: 'CREATE',
      entityType: 'transport_company',
      entityId: company.id,
      newValues: company,
      userId: req.user!.userId,
    });

    res.status(201).json(company);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Такая транспортная компания уже существует' });
      return;
    }
    res.status(500).json({ error: 'Ошибка при создании транспортной компании' });
  }
}

export async function updateTransportCompany(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, contactInfo } = req.body;
    const company = await prisma.transportCompany.update({
      where: { id: parseInt(id) },
      data: { name, contactInfo },
    });

    await createAuditLog({
      action: 'UPDATE',
      entityType: 'transport_company',
      entityId: company.id,
      newValues: company,
      userId: req.user!.userId,
    });

    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении транспортной компании' });
  }
}

export async function deleteTransportCompany(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const entityId = parseInt(id);

    const usedInShipments = await prisma.shipment.count({
      where: { transportCompanyId: entityId, deletedAt: null },
    });

    if (usedInShipments > 0) {
      res.status(400).json({ error: 'Невозможно удалить: транспортная компания используется в поставках' });
      return;
    }

    await prisma.transportCompany.delete({ where: { id: entityId } });

    await createAuditLog({
      action: 'DELETE',
      entityType: 'transport_company',
      entityId,
      userId: req.user!.userId,
    });

    res.json({ message: 'Транспортная компания удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении транспортной компании' });
  }
}

// === ВОДИТЕЛИ ===
export async function getDrivers(req: Request, res: Response): Promise<void> {
  try {
    const drivers = await prisma.driver.findMany({ orderBy: { fullName: 'asc' } });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении списка водителей' });
  }
}

export async function createDriver(req: Request, res: Response): Promise<void> {
  try {
    const { fullName, phone } = req.body;
    const driver = await prisma.driver.create({ data: { fullName, phone } });

    await createAuditLog({
      action: 'CREATE',
      entityType: 'driver',
      entityId: driver.id,
      newValues: driver,
      userId: req.user!.userId,
    });

    res.status(201).json(driver);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании водителя' });
  }
}

export async function updateDriver(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { fullName, phone } = req.body;
    const driver = await prisma.driver.update({
      where: { id: parseInt(id) },
      data: { fullName, phone },
    });

    await createAuditLog({
      action: 'UPDATE',
      entityType: 'driver',
      entityId: driver.id,
      newValues: driver,
      userId: req.user!.userId,
    });

    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении водителя' });
  }
}

export async function deleteDriver(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const entityId = parseInt(id);

    const usedInShipments = await prisma.shipment.count({
      where: { driverId: entityId, deletedAt: null },
    });

    if (usedInShipments > 0) {
      res.status(400).json({ error: 'Невозможно удалить: водитель используется в поставках' });
      return;
    }

    await prisma.driver.delete({ where: { id: entityId } });

    await createAuditLog({
      action: 'DELETE',
      entityType: 'driver',
      entityId,
      userId: req.user!.userId,
    });

    res.json({ message: 'Водитель удалён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении водителя' });
  }
}
