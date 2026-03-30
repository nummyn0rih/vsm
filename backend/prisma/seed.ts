import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Создаём администратора
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      fullName: 'Администратор',
      role: Role.ADMIN,
    },
  });

  // Создаём обычного пользователя
  const userPassword = await bcrypt.hash('user123', 10);
  await prisma.user.upsert({
    where: { username: 'user' },
    update: {},
    create: {
      username: 'user',
      password: userPassword,
      fullName: 'Пользователь',
      role: Role.USER,
    },
  });

  // Овощи
  const vegetables = ['Картофель', 'Морковь', 'Свёкла', 'Капуста', 'Лук', 'Томаты', 'Огурцы', 'Перец'];
  for (const name of vegetables) {
    await prisma.vegetable.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Поставщики
  const suppliers = [
    { name: 'ООО "Агрофирма"', contactInfo: '+7 (900) 111-22-33' },
    { name: 'ИП Иванов', contactInfo: '+7 (900) 444-55-66' },
    { name: 'КФХ "Урожай"', contactInfo: '+7 (900) 777-88-99' },
  ];
  for (const supplier of suppliers) {
    await prisma.supplier.upsert({
      where: { name: supplier.name },
      update: {},
      create: supplier,
    });
  }

  // Транспортные компании
  const companies = [
    { name: 'ТК "Быстрая доставка"', contactInfo: '+7 (800) 100-20-30' },
    { name: 'АвтоТранс', contactInfo: '+7 (800) 400-50-60' },
  ];
  for (const company of companies) {
    await prisma.transportCompany.upsert({
      where: { name: company.name },
      update: {},
      create: company,
    });
  }

  // Водители
  const drivers = [
    { fullName: 'Петров Пётр Петрович', phone: '+7 (912) 111-11-11' },
    { fullName: 'Сидоров Сидор Сидорович', phone: '+7 (912) 222-22-22' },
    { fullName: 'Козлов Андрей Викторович', phone: '+7 (912) 333-33-33' },
  ];
  for (const driver of drivers) {
    await prisma.driver.upsert({
      where: { id: 0 },
      update: {},
      create: driver,
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });