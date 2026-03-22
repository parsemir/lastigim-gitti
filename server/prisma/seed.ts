import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@buca.gov.tr' },
    update: {},
    create: {
      email: 'admin@buca.gov.tr',
      password: adminPassword,
      name: 'Buca Belediyesi',
      role: 'ADMIN',
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'ahmet@example.com' },
    update: {},
    create: {
      email: 'ahmet@example.com',
      password: userPassword,
      name: 'Ahmet Yılmaz',
      role: 'RESIDENT',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'ayse@example.com' },
    update: {},
    create: {
      email: 'ayse@example.com',
      password: userPassword,
      name: 'Ayşe Kaya',
      role: 'RESIDENT',
    },
  });

  // Sample reports around Buca, Izmir
  const reports = [
    { lat: 38.3888, lng: 27.1750, desc: 'Büyük çukur, araçlar için tehlikeli', status: 'REPORTED', userId: user1.id },
    { lat: 38.3920, lng: 27.1800, desc: 'Kaldırımda derin çukur', status: 'UNDER_REVIEW', userId: user2.id },
    { lat: 38.3850, lng: 27.1720, desc: 'Yol çökmüş, acil müdahale gerekli', status: 'SCHEDULED', userId: user1.id },
    { lat: 38.3905, lng: 27.1780, desc: 'Küçük çukur ama büyüyor', status: 'REPORTED', userId: user2.id },
    { lat: 38.3870, lng: 27.1690, desc: 'Yağmur sonrası oluşan çukur', status: 'FIXED', userId: user1.id },
  ];

  for (const r of reports) {
    const report = await prisma.report.create({
      data: {
        latitude: r.lat,
        longitude: r.lng,
        description: r.desc,
        status: r.status,
        userId: r.userId,
        fixedAt: r.status === 'FIXED' ? new Date() : null,
      },
    });

    // Add some votes
    await prisma.vote.create({ data: { value: 1, userId: user1.id, reportId: report.id } });
    if (Math.random() > 0.3) {
      await prisma.vote.create({ data: { value: 1, userId: user2.id, reportId: report.id } });
    }
  }

  console.log('Seed data created successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
