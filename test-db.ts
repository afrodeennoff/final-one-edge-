import { PrismaClient } from './prisma/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || '';

const pool = new pg.Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log('Successfully connected to database. User count:', userCount);
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
