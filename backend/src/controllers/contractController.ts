import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { createAuditLog } from '../services/logService';

export const contractValidation = [
  body('supplierId').isInt({ min: 1 }).withMessage('Укажите поставщика'),
  body('vegetableId').isInt({ min: 1 }).withMessage('Укажите овощ'),
  body('volumeKg')
    .isFloat({ gt: 0 })
    .withMessage('Объём должен быть больше 0'),
];

const CONTRACT_INCLUDE = {
  supplier: { select: { id: true, name: true } },
  vegetable: { select: { id: true, name: true } },
} as const;

export async function getContracts(_req: Request, res: Response): Promise<void> {
  try {
    const contracts = await prisma.supplierContract.findMany({
      include: CONTRACT_INCLUDE,
    });
    contracts.sort((a, b) =>
      a.supplier.name === b.supplier.name
        ? a.vegetable.name.localeCompare(b.vegetable.name, 'ru')
        : a.supplier.name.localeCompare(b.supplier.name, 'ru'),
    );
    res.json(contracts);
  } catch (error) {
    console.error('getContracts error:', error);
    res.status(500).json({ error: 'Ошибка при получении контрактов' });
  }
}

export async function createContract(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { supplierId, vegetableId, volumeKg } = req.body;
    const contract = await prisma.supplierContract.create({
      data: { supplierId, vegetableId, volumeKg },
      include: CONTRACT_INCLUDE,
    });

    await createAuditLog({
      action: 'CREATE',
      entityType: 'contract',
      entityId: contract.id,
      newValues: contract,
      userId: req.user!.userId,
    });

    res.status(201).json(contract);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      res
        .status(400)
        .json({ error: 'Контракт для этого поставщика и овоща уже существует' });
      return;
    }
    console.error('createContract error:', error);
    res.status(500).json({ error: 'Ошибка при создании контракта' });
  }
}

export async function updateContract(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const id = parseInt(req.params.id);
    const { supplierId, vegetableId, volumeKg } = req.body;

    const oldContract = await prisma.supplierContract.findUnique({ where: { id } });
    if (!oldContract) {
      res.status(404).json({ error: 'Контракт не найден' });
      return;
    }

    const updated = await prisma.supplierContract.update({
      where: { id },
      data: { supplierId, vegetableId, volumeKg },
      include: CONTRACT_INCLUDE,
    });

    await createAuditLog({
      action: 'UPDATE',
      entityType: 'contract',
      entityId: id,
      oldValues: oldContract,
      newValues: updated,
      userId: req.user!.userId,
    });

    res.json(updated);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      res
        .status(400)
        .json({ error: 'Контракт для этого поставщика и овоща уже существует' });
      return;
    }
    console.error('updateContract error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении контракта' });
  }
}

export async function deleteContract(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const contract = await prisma.supplierContract.findUnique({ where: { id } });
    if (!contract) {
      res.status(404).json({ error: 'Контракт не найден' });
      return;
    }

    await prisma.supplierContract.delete({ where: { id } });

    await createAuditLog({
      action: 'DELETE',
      entityType: 'contract',
      entityId: id,
      oldValues: contract,
      userId: req.user!.userId,
    });

    res.json({ message: 'Контракт удалён' });
  } catch (error) {
    console.error('deleteContract error:', error);
    res.status(500).json({ error: 'Ошибка при удалении контракта' });
  }
}
