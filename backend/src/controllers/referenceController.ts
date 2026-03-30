import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createAuditLog } from '../services/logService';

const prisma = new PrismaClient();

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