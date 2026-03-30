import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LogParams {
  action: string;
  entityType: string;
  entityId: number;
  oldValues?: any;
  newValues?: any;
  userId: number;
  shipmentId?: number;
}

export async function createAuditLog(params: LogParams) {
  return prisma.auditLog.create({
    data: {
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValues: params.oldValues || undefined,
      newValues: params.newValues || undefined,
      userId: params.userId,
      shipmentId: params.shipmentId || undefined,
    },
  });
}