import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Подключение к БД успешно!');

    const users = await prisma.user.count();
    const vegetables = await prisma.vegetable.count();
    const suppliers = await prisma.supplier.count();
    const drivers = await prisma.driver.count();

    console.log(`👤 Пользователей: ${users}`);
    console.log(`🥕 Овощей: ${vegetables}`);
    console.log(`🏭 Поставщиков: ${suppliers}`);
    console.log(`🚗 Водителей: ${drivers}`);
  } catch (error) {
    console.error('❌ Ошибка подключения:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
