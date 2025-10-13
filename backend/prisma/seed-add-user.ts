import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBool() {
  return Math.random() < 0.5;
}

function randomPastDate(daysBack: number) {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysBack));
  return date;
}

async function main() {
  console.log('👤 Adding new users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const usersData = Array.from({ length: 10 }).map((_, i) => ({
    name: `NewUser${i + 1}`,
    email: `newuser${i + 1}@example.com`,
    password: passwordHash,
    avatar: `https://i.pravatar.cc/150?img=${i + 21}`, // tránh trùng avatar cũ
    bio: `Hello, I am NewUser${i + 1}`,
    role: 'user',
    online: randomBool(),
    lastSeen: randomPastDate(5),
  }));

  // Tạo mới, bỏ qua nếu email đã tồn tại
  await prisma.user.createMany({
    data: usersData,
    skipDuplicates: true,
  });

  console.log('✅ New users added successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
