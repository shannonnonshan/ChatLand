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
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1️⃣ Tạo 10 users
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

  const users = [];
  for (const u of usersData) {
    const user = await prisma.user.create({ data: u });
    users.push(user);
  }

  // 2️⃣ Tạo full friendships (mọi user kết bạn với nhau)
  const friendships = [];
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      friendships.push({ userAId: users[i].id, userBId: users[j].id });
    }
  }
  await prisma.friendship.createMany({
    data: friendships,
    skipDuplicates: true,
  });

  // 3️⃣ Tạo 20 posts ngẫu nhiên
  const posts = [];
  for (let i = 0; i < 20; i++) {
    const user = users[randomInt(0, users.length - 1)];
    posts.push({
      description: `Post ${i + 1} by ${user.name}`,
      userId: user.id,
      imageUrl: `https://picsum.photos/200/300?random=${i + 1}`,
    });
  }
  await prisma.post.createMany({ data: posts });

  // 4️⃣ Tạo 3 group chat
  const conversations = [];
  for (let i = 0; i < 3; i++) {
    const conv = await prisma.conversation.create({
      data: { name: `Group Chat ${i + 1}`, isGroup: true },
    });
    conversations.push(conv);
  }

  // 5️⃣ Thêm participants (mọi user tham gia tất cả group chat)
  const participants = [];
  for (const conv of conversations) {
    for (const user of users) {
      participants.push({ userId: user.id, conversationId: conv.id });
    }
  }
  await prisma.participant.createMany({
    data: participants,
    skipDuplicates: true,
  });

  // 6️⃣ Tạo messages cho từng conversation
  const messages = [];
  for (const conv of conversations) {
    for (let i = 0; i < 15; i++) {
      // 15 messages mỗi group
      const user = users[randomInt(0, users.length - 1)];
      messages.push({
        content: `Message ${i + 1} in ${conv.name} by ${user.name}`,
        senderId: user.id,
        conversationId: conv.id,
        createdAt: randomPastDate(3),
      });
    }
  }
  await prisma.message.createMany({ data: messages });

  console.log('✅ Advanced seed created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
