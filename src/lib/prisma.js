import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Ensure DATABASE_URL is set (with fallback for tests)
if (!process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === 'test') {
    process.env.DATABASE_URL = `file:${path.resolve(process.cwd(), 'test.db')}`;
  } else {
    throw new Error('DATABASE_URL environment variable is required');
  }
}

let prismaInstance = null;

// Lazy initialization - only create client when first accessed
export const prisma = new Proxy({}, {
  get(target, prop) {
    if (!prismaInstance) {
      // Extract the database path from the DATABASE_URL
      const dbPath = process.env.DATABASE_URL.replace('file:', '');
      
      // Create adapter for Prisma 7
      const db = new Database(dbPath);
      const adapter = new PrismaBetterSqlite3(db);
      
      // Initialize PrismaClient with adapter
      prismaInstance = new PrismaClient({ adapter });
    }
    return prismaInstance[prop];
  }
});
