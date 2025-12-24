import './env.js';
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';
import { setupDatabase } from './setup.js';
import jwt from 'jsonwebtoken';
import express from "express";
import request from 'supertest'
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });



describe('Auth Middleware', ()=>{
    let app;
    before(()=>{
        app = express ();
        app.get('/protected', (req, res, next)=>{

            if (!req.headers.authorization)return res.status(401).send('No Token');
        });
    });
    test('should reject request without token', async ()=>{
        const res = request(app).get('/protected');
        assert.strictEqual(res.status, 401);
    })
});