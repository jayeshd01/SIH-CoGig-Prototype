require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Explicitly calling $connect()...');
  await prisma.$connect();
  console.log('Connected successfully!');
  const services = await prisma.service.findMany({ take: 3 });
  console.log('Services query result:', services.map(s => s.name));
  await prisma.$disconnect();
}

run().catch(console.error);
