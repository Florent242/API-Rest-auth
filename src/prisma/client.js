import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL non défini dans le .env !");
}

// Crée l'adapter avec l'URL
const adapter = new PrismaBetterSqlite3({ url: connectionString });

// Crée le client Prisma
const prisma = new PrismaClient({ adapter });

export default prisma;
