import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

// Only load .env if variables aren't already set (allows test to override)
if (!process.env.DATABASE_URL) {
  dotenv.config();
}

let prismaInstance = null;

// Lazy initialization - only create client when first accessed
export const prisma = new Proxy({}, {
  get(target, prop) {
    if (!prismaInstance) {
      // Ensure DATABASE_URL is set at initialization time
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is required');
      }
      
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
