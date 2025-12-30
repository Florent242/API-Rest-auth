import { PrismaClient } from '@prisma/client';
import sqlite from 'better-sqlite3';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const db = new sqlite('prisma/dev.db');
const adapter = new PrismaBetterSqlite3(db);

const prisma = new PrismaClient({ adapter });

export default prisma;