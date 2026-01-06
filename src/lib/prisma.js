import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Sécurité : on vérifie la variable
if (!process.env.DATABASE_URL) {
  throw new Error(" DATABASE_URL est undefined");
}

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
