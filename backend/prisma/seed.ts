import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const usersData: {
    name: string;
    email: string;
    password: string;
    role: string;
    avatar: string;
    twoFactorEnabled: boolean;
  }[] = Array.from({ length: 10 }).map((_, i) => ({
    name: `User${i + 1}`,
    email: `user${i + 1}@example.com`,
    password: bcrypt.hashSync('password123', 10), // ✅ hash ok
    role: i === 0 ? 'admin' : 'user',
    avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
    twoFactorEnabled: false,
  }));

  const users: User[] = [];

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    users.push(user);
  }

  // 20 Posts
  for (let i = 0; i < 20; i++) {
    await prisma.post.create({
      data: {
        description: `Post #${i + 1} của ${users[i % 10].name}`,
        imageUrl: `https://picsum.photos/seed/post${i + 1}/600/400`,
        userId: users[i % 10].id,
      },
    });
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
