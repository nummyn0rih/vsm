import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

interface BreakdownItem {
  id: number;
  name: string;
  count: number;
  totalWeight: number;
}

interface DailyVegetableBucket {
  date: string;
  vegetable: string;
  weight: number;
  count: number;
}

interface SupplierVegetableBucket {
  supplier: string;
  vegetable: string;
  actualKg: number;
  contractKg: number;
  count: number;
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function getSummary(req: Request, res: Response): Promise<void> {
  const from = parseDate(req.query.from);
  const to = parseDate(req.query.to);

  if (!from || !to) {
    res.status(400).json({ error: 'Параметры from и to обязательны (ISO 8601)' });
    return;
  }
  if (from > to) {
    res.status(400).json({ error: 'from должен быть не позже to' });
    return;
  }

  try {
    const where = {
      deletedAt: null,
      arrivalDate: { gte: from, lte: to },
    } as const;

    const [rows, bySupplierRaw, byTcRaw, byDriverRaw] = await Promise.all([
      prisma.shipment.findMany({
        where,
        select: {
          arrivalDate: true,
          weight: true,
          vegetable: { select: { name: true } },
        },
      }),
      prisma.shipment.groupBy({
        by: ['supplierId'],
        where,
        _count: { _all: true },
        _sum: { weight: true },
      }),
      prisma.shipment.groupBy({
        by: ['transportCompanyId'],
        where,
        _count: { _all: true },
        _sum: { weight: true },
      }),
      prisma.shipment.groupBy({
        by: ['driverId'],
        where,
        _count: { _all: true },
        _sum: { weight: true },
      }),
    ]);

    const daily = buildDailySeries(from, to, rows);
    const dailyByVegetable = buildDailyByVegetable(rows);

    const [suppliers, tcs, drivers] = await Promise.all([
      prisma.supplier.findMany({
        where: { id: { in: bySupplierRaw.map((r) => r.supplierId) } },
        select: { id: true, name: true },
      }),
      prisma.transportCompany.findMany({
        where: { id: { in: byTcRaw.map((r) => r.transportCompanyId) } },
        select: { id: true, name: true },
      }),
      prisma.driver.findMany({
        where: { id: { in: byDriverRaw.map((r) => r.driverId) } },
        select: { id: true, fullName: true },
      }),
    ]);

    const bySupplier: BreakdownItem[] = bySupplierRaw
      .map((r) => ({
        id: r.supplierId,
        name: suppliers.find((s) => s.id === r.supplierId)?.name ?? '—',
        count: r._count._all,
        totalWeight: r._sum.weight ?? 0,
      }))
      .sort((a, b) => b.count - a.count);

    const byTransportCompany: BreakdownItem[] = byTcRaw
      .map((r) => ({
        id: r.transportCompanyId,
        name: tcs.find((t) => t.id === r.transportCompanyId)?.name ?? '—',
        count: r._count._all,
        totalWeight: r._sum.weight ?? 0,
      }))
      .sort((a, b) => b.count - a.count);

    const byDriver: BreakdownItem[] = byDriverRaw
      .map((r) => ({
        id: r.driverId,
        name: drivers.find((d) => d.id === r.driverId)?.fullName ?? '—',
        count: r._count._all,
        totalWeight: r._sum.weight ?? 0,
      }))
      .sort((a, b) => b.count - a.count);

    res.json({ daily, dailyByVegetable, bySupplier, byTransportCompany, byDriver });
  } catch (error) {
    console.error('getSummary error:', error);
    res.status(500).json({ error: 'Ошибка при получении аналитики' });
  }
}

export async function getTotal(_req: Request, res: Response): Promise<void> {
  try {
    const where = { deletedAt: null } as const;

    const [rows, byTcRaw, contracts] = await Promise.all([
      prisma.shipment.findMany({
        where,
        select: {
          weight: true,
          supplier: { select: { id: true, name: true } },
          vegetable: { select: { id: true, name: true } },
        },
      }),
      prisma.shipment.groupBy({
        by: ['transportCompanyId'],
        where,
        _count: { _all: true },
        _sum: { weight: true },
      }),
      prisma.supplierContract.findMany({
        include: {
          supplier: { select: { id: true, name: true } },
          vegetable: { select: { id: true, name: true } },
        },
      }),
    ]);

    const svMap = new Map<string, SupplierVegetableBucket>();
    for (const row of rows) {
      const key = `${row.supplier.id}||${row.vegetable.id}`;
      const prev =
        svMap.get(key) ??
        {
          supplier: row.supplier.name,
          vegetable: row.vegetable.name,
          actualKg: 0,
          contractKg: 0,
          count: 0,
        };
      prev.actualKg += row.weight ?? 0;
      prev.count += 1;
      svMap.set(key, prev);
    }
    for (const c of contracts) {
      const key = `${c.supplier.id}||${c.vegetable.id}`;
      const prev =
        svMap.get(key) ??
        {
          supplier: c.supplier.name,
          vegetable: c.vegetable.name,
          actualKg: 0,
          contractKg: 0,
          count: 0,
        };
      prev.contractKg = c.volumeKg;
      svMap.set(key, prev);
    }
    const bySupplierVegetable = Array.from(svMap.values())
      .map((v) => ({
        ...v,
        actualKg: Math.round(v.actualKg * 10) / 10,
        contractKg: Math.round(v.contractKg * 10) / 10,
      }))
      .sort((a, b) =>
        a.supplier === b.supplier
          ? a.vegetable.localeCompare(b.vegetable, 'ru')
          : a.supplier.localeCompare(b.supplier, 'ru'),
      );

    const tcs = await prisma.transportCompany.findMany({
      where: { id: { in: byTcRaw.map((r) => r.transportCompanyId) } },
      select: { id: true, name: true },
    });
    const byTransportCompany: BreakdownItem[] = byTcRaw
      .map((r) => ({
        id: r.transportCompanyId,
        name: tcs.find((t) => t.id === r.transportCompanyId)?.name ?? '—',
        count: r._count._all,
        totalWeight: r._sum.weight ?? 0,
      }))
      .sort((a, b) => b.totalWeight - a.totalWeight);

    res.json({ bySupplierVegetable, byTransportCompany });
  } catch (error) {
    console.error('getTotal error:', error);
    res.status(500).json({ error: 'Ошибка при получении сводки' });
  }
}

type ShipmentRow = {
  arrivalDate: Date | null;
  weight: number | null;
  vegetable: { name: string };
};

function buildDailySeries(from: Date, to: Date, rows: ShipmentRow[]) {
  const bucket = new Map<string, { count: number; totalWeight: number }>();

  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    bucket.set(formatDay(cursor), { count: 0, totalWeight: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const row of rows) {
    if (!row.arrivalDate) continue;
    const key = formatDay(row.arrivalDate);
    const entry = bucket.get(key);
    if (!entry) continue;
    entry.count += 1;
    entry.totalWeight += row.weight ?? 0;
  }

  return Array.from(bucket.entries()).map(([date, v]) => ({
    date,
    count: v.count,
    totalWeight: Math.round(v.totalWeight * 10) / 10,
  }));
}

function buildDailyByVegetable(rows: ShipmentRow[]): DailyVegetableBucket[] {
  const bucket = new Map<string, { weight: number; count: number }>();

  for (const row of rows) {
    if (!row.arrivalDate) continue;
    const date = formatDay(row.arrivalDate);
    const name = row.vegetable.name;
    const key = `${date}||${name}`;
    const prev = bucket.get(key) ?? { weight: 0, count: 0 };
    prev.weight += row.weight ?? 0;
    prev.count += 1;
    bucket.set(key, prev);
  }

  return Array.from(bucket.entries())
    .map(([key, v]) => {
      const [date, vegetable] = key.split('||');
      return {
        date,
        vegetable,
        weight: Math.round(v.weight * 10) / 10,
        count: v.count,
      };
    })
    .sort((a, b) =>
      a.date === b.date
        ? a.vegetable.localeCompare(b.vegetable, 'ru')
        : a.date.localeCompare(b.date),
    );
}
