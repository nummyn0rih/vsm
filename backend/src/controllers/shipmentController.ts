import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ShipmentStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { createAuditLog } from '../services/logService';

export const shipmentValidation = [
  body('vegetableId').isInt({ min: 1 }).withMessage('Укажите овощ'),
  body('supplierId').isInt({ min: 1 }).withMessage('Укажите поставщика'),
  body('transportCompanyId').isInt({ min: 1 }).withMessage('Укажите транспортную компанию'),
  body('driverId').isInt({ min: 1 }).withMessage('Укажите водителя'),
  body('quantity').isFloat({ min: 0 }).withMessage('Количество должно быть положительным числом'),
  body('unit').optional().isString(),
  body('weight').optional({ nullable: true }).isFloat({ min: 0 }),
  body('departureDate').optional({ nullable: true }).isISO8601(),
  body('arrivalDate').optional({ nullable: true }).isISO8601(),
];

const SHIPMENT_INCLUDE = {
  vegetable: true,
  supplier: true,
  transportCompany: true,
  driver: true,
  createdBy: { select: { id: true, fullName: true, username: true } },
} as const;

export async function getShipments(req: Request, res: Response): Promise<void> {
  try {
    const {
      status,
      vegetableId,
      supplierId,
      transportCompanyId,
      driverId,
      dateFrom,
      dateTo,
      search,
      page = '1',
      pageSize = '20',
    } = req.query;

    const where: any = { deletedAt: null };

    if (status) where.status = status as ShipmentStatus;
    if (vegetableId) where.vegetableId = parseInt(vegetableId as string);
    if (supplierId) where.supplierId = parseInt(supplierId as string);
    if (transportCompanyId) where.transportCompanyId = parseInt(transportCompanyId as string);
    if (driverId) where.driverId = parseInt(driverId as string);
    if (dateFrom || dateTo) {
      where.departureDate = {};
      if (dateFrom) where.departureDate.gte = new Date(dateFrom as string);
      if (dateTo) where.departureDate.lte = new Date(dateTo as string);
    }
    if (search) {
      where.OR = [
        { notes: { contains: search as string, mode: 'insensitive' } },
        { vegetable: { name: { contains: search as string, mode: 'insensitive' } } },
        { supplier: { name: { contains: search as string, mode: 'insensitive' } } },
        { driver: { fullName: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);
    const take = parseInt(pageSize as string);

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: SHIPMENT_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.shipment.count({ where }),
    ]);

    res.json({
      data: shipments,
      total,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('getShipments error:', error);
    res.status(500).json({ error: 'Ошибка при получении поставок' });
  }
}

export async function getShipment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const shipment = await prisma.shipment.findUnique({
      where: { id: parseInt(id) },
      include: SHIPMENT_INCLUDE,
    });

    if (!shipment || shipment.deletedAt) {
      res.status(404).json({ error: 'Поставка не найдена' });
      return;
    }

    res.json(shipment);
  } catch (error) {
    console.error('getShipment error:', error);
    res.status(500).json({ error: 'Ошибка при получении поставки' });
  }
}

export async function createShipment(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const {
      vegetableId,
      supplierId,
      transportCompanyId,
      driverId,
      status,
      quantity,
      unit,
      weight,
      departureDate,
      arrivalDate,
      notes,
    } = req.body;

    const shipment = await prisma.shipment.create({
      data: {
        vegetableId,
        supplierId,
        transportCompanyId,
        driverId,
        status: status || 'PLANNED',
        quantity,
        unit: unit || 'кг',
        weight,
        departureDate: departureDate ? new Date(departureDate) : null,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
        notes,
        createdById: req.user!.userId,
      },
      include: SHIPMENT_INCLUDE,
    });

    await createAuditLog({
      action: 'CREATE',
      entityType: 'shipment',
      entityId: shipment.id,
      newValues: shipment,
      userId: req.user!.userId,
      shipmentId: shipment.id,
    });

    res.status(201).json(shipment);
  } catch (error) {
    console.error('createShipment error:', error);
    res.status(500).json({ error: 'Ошибка при создании поставки' });
  }
}

export async function updateShipment(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { id } = req.params;
    const shipmentId = parseInt(id);

    const oldShipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });

    if (!oldShipment || oldShipment.deletedAt) {
      res.status(404).json({ error: 'Поставка не найдена' });
      return;
    }

    const {
      vegetableId,
      supplierId,
      transportCompanyId,
      driverId,
      status,
      quantity,
      unit,
      weight,
      departureDate,
      arrivalDate,
      notes,
    } = req.body;

    const updatedShipment = await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        vegetableId,
        supplierId,
        transportCompanyId,
        driverId,
        status,
        quantity,
        unit,
        weight,
        departureDate: departureDate ? new Date(departureDate) : undefined,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : undefined,
        notes,
      },
      include: SHIPMENT_INCLUDE,
    });

    await createAuditLog({
      action: 'UPDATE',
      entityType: 'shipment',
      entityId: shipmentId,
      oldValues: oldShipment,
      newValues: updatedShipment,
      userId: req.user!.userId,
      shipmentId: shipmentId,
    });

    res.json(updatedShipment);
  } catch (error) {
    console.error('updateShipment error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении поставки' });
  }
}

export async function updateShipmentStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const shipmentId = parseInt(id);

    const oldShipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });

    if (!oldShipment || oldShipment.deletedAt) {
      res.status(404).json({ error: 'Поставка не найдена' });
      return;
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: shipmentId },
      data: { status },
      include: {
        vegetable: true,
        supplier: true,
        transportCompany: true,
        driver: true,
      },
    });

    await createAuditLog({
      action: 'STATUS_CHANGE',
      entityType: 'shipment',
      entityId: shipmentId,
      oldValues: { status: oldShipment.status },
      newValues: { status: updatedShipment.status },
      userId: req.user!.userId,
      shipmentId: shipmentId,
    });

    res.json(updatedShipment);
  } catch (error) {
    console.error('updateShipmentStatus error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении статуса' });
  }
}

export async function deleteShipment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const shipmentId = parseInt(id);

    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });

    if (!shipment || shipment.deletedAt) {
      res.status(404).json({ error: 'Поставка не найдена' });
      return;
    }

    await prisma.shipment.update({
      where: { id: shipmentId },
      data: { deletedAt: new Date() },
    });

    await createAuditLog({
      action: 'DELETE',
      entityType: 'shipment',
      entityId: shipmentId,
      oldValues: shipment,
      userId: req.user!.userId,
      shipmentId: shipmentId,
    });

    res.json({ message: 'Поставка удалена' });
  } catch (error) {
    console.error('deleteShipment error:', error);
    res.status(500).json({ error: 'Ошибка при удалении поставки' });
  }
}
