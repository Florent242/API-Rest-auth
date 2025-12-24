import './env.js';
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';
import { setupDatabase } from './setup.js';
import jwt from 'jsonwebtoken';
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });



describe('Auth Middleware', ()=>{

});