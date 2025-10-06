import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
      { name: 'Charlie', email: 'charlie@example.com' },
      { name: 'Diana', email: 'diana@example.com' },
    ],
  });

  console.log('✅ Seed data inserted successfully!');
}

main()
  .catch((e: unknown) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
