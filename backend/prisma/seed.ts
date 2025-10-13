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
  console.log('🧹 Cleaning old data...');
  await prisma.message.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log('👤 Creating users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const usersData = Array.from({ length: 10 }).map((_, i) => ({
    name: `User${i + 1}`,
    email: `user${i + 1}@example.com`,
    password: passwordHash,
    avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
    bio: `Hello, I am User${i + 1}`,
    role: 'user',
    online: randomBool(),
    lastSeen: randomPastDate(5),
  }));

  const users = await prisma.user.createMany({
    data: usersData,
    skipDuplicates: true,
  });

  const allUsers = await prisma.user.findMany();

  console.log('🤝 Creating friendships...');
  const friendships = [];
  for (let i = 0; i < allUsers.length; i++) {
    for (let j = i + 1; j < allUsers.length; j++) {
      friendships.push({ userAId: allUsers[i].id, userBId: allUsers[j].id });
    }
  }

  await prisma.friendship.createMany({
    data: friendships,
    skipDuplicates: true,
  });

  console.log('📝 Creating posts...');
  const posts = [];
  for (let i = 0; i < 20; i++) {
    const user = allUsers[randomInt(0, allUsers.length - 1)];
    posts.push({
      description: `Post ${i + 1} by ${user.name}`,
      userId: user.id,
      imageUrl: `https://picsum.photos/200/300?random=${i + 1}`,
      createdAt: randomPastDate(10),
    });
  }

  await prisma.post.createMany({ data: posts });

  console.log('✉️ Creating messages (1-1)...');
  const messages = [];
  for (let i = 0; i < 50; i++) {
    const sender = allUsers[randomInt(0, allUsers.length - 1)];
    let receiver = allUsers[randomInt(0, allUsers.length - 1)];
    while (receiver.id === sender.id) {
      receiver = allUsers[randomInt(0, allUsers.length - 1)];
    }

    messages.push({
      content: `Hello from ${sender.name} to ${receiver.name} (${i + 1})`,
      senderId: sender.id,
      receiverId: receiver.id,
      createdAt: randomPastDate(7),
      seen: randomBool(),
    });
  }

  await prisma.message.createMany({ data: messages });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(() => prisma.$disconnect());

