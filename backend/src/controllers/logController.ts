import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function getLogs(req: Request, res: Response): Promise<void> {
  try {
    const {
      entityType,
      action,
      userId,
      dateFrom,
      dateTo,
      page = '1',
      pageSize = '50',
    } = req.query;

    const where: any = {};

    if (entityType) where.entityType = entityType as string;
    if (action) where.action = action as string;
    if (userId) where.userId = parseInt(userId as string);
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
      if (dateTo) where.createdAt.lte = new Date(dateTo as string);
    }

    const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);
    const take = parseInt(pageSize as string);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, fullName: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      data: logs,
      total,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('getLogs error:', error);
    res.status(500).json({ error: 'Ошибка при получении логов' });
  }
}
