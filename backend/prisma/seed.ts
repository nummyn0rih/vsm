import { PrismaClient, Role, ShipmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 1): number {
  const v = Math.random() * (max - min) + min;
  const f = Math.pow(10, decimals);
  return Math.round(v * f) / f;
}

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: adminPassword, fullName: 'Администратор', role: Role.ADMIN },
  });

  const userPassword = await bcrypt.hash('user123', 10);
  await prisma.user.upsert({
    where: { username: 'user' },
    update: {},
    create: { username: 'user', password: userPassword, fullName: 'Пользователь', role: Role.USER },
  });

  const vegetables = ['Огурец', 'Черри', 'Халапеньо', 'Патиссон'];
  for (const name of vegetables) {
    await prisma.vegetable.upsert({ where: { name }, update: {}, create: { name } });
  }

  const suppliers = [
    { name: 'ООО "Агрофирма"', contactInfo: '+7 (900) 111-22-33' },
    { name: 'ИП Иванов', contactInfo: '+7 (900) 444-55-66' },
    { name: 'КФХ "Урожай"', contactInfo: '+7 (900) 777-88-99' },
  ];
  for (const supplier of suppliers) {
    await prisma.supplier.upsert({ where: { name: supplier.name }, update: {}, create: supplier });
  }

  const companies = [
    { name: 'ТК "Быстрая доставка"', contactInfo: '+7 (800) 100-20-30' },
    { name: 'АвтоТранс', contactInfo: '+7 (800) 400-50-60' },
  ];
  for (const company of companies) {
    await prisma.transportCompany.upsert({ where: { name: company.name }, update: {}, create: company });
  }

  const drivers = [
    { fullName: 'Петров Пётр Петрович', phone: '+7 (912) 111-11-11' },
    { fullName: 'Сидоров Сидор Сидорович', phone: '+7 (912) 222-22-22' },
    { fullName: 'Козлов Андрей Викторович', phone: '+7 (912) 333-33-33' },
  ];
  for (const driver of drivers) {
    const existing = await prisma.driver.findFirst({ where: { fullName: driver.fullName } });
    if (!existing) await prisma.driver.create({ data: driver });
  }

  const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (!admin) throw new Error('admin user not found');

  const existingShipments = await prisma.shipment.count({ where: { deletedAt: null } });
  if (existingShipments >= 50) {
    console.log(`Shipments already seeded (${existingShipments}), skipping mock generation`);
  } else {
    const [vegs, supps, tcs, drvs] = await Promise.all([
      prisma.vegetable.findMany(),
      prisma.supplier.findMany(),
      prisma.transportCompany.findMany(),
      prisma.driver.findMany(),
    ]);

    const units = ['кг', 'т', 'ящ'];
    const notesPool = [
      null, null, null,
      'Срочная поставка',
      'Проверить качество при приёмке',
      'Первый сорт',
      'Требуется охлаждение',
      'Партия по договору №' + randInt(100, 999),
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const shipmentsToCreate: any[] = [];
    let dayOffset = 0;
    while (shipmentsToCreate.length < 50) {
      const perDay = randInt(1, 4);
      for (let i = 0; i < perDay && shipmentsToCreate.length < 50; i++) {
        const departure = new Date(today);
        departure.setDate(departure.getDate() + dayOffset);
        departure.setHours(randInt(6, 18), randInt(0, 59), 0, 0);

        const arrival = new Date(departure);
        arrival.setHours(arrival.getHours() + randInt(4, 36));

        const unit = pick(units);
        const quantity = unit === 'т' ? randFloat(1, 20, 2) : unit === 'ящ' ? randInt(10, 200) : randFloat(50, 2000, 1);
        const weightKg = unit === 'т' ? quantity * 1000 : unit === 'кг' ? quantity : quantity * randFloat(8, 15, 1);

        shipmentsToCreate.push({
          vegetableId: pick(vegs).id,
          supplierId: pick(supps).id,
          transportCompanyId: pick(tcs).id,
          driverId: pick(drvs).id,
          status: Math.random() < 0.35 ? ShipmentStatus.IN_TRANSIT : ShipmentStatus.PLANNED,
          quantity,
          unit,
          weight: Math.round(weightKg * 10) / 10,
          departureDate: departure,
          arrivalDate: arrival,
          notes: pick(notesPool),
          createdById: admin.id,
        });
      }
      dayOffset++;
    }

    await prisma.shipment.createMany({ data: shipmentsToCreate });
    console.log(`Created ${shipmentsToCreate.length} mock shipments spanning ${dayOffset} days`);
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
