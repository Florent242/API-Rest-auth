import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import express from 'express';
import request from 'supertest';
import { validationResult } from 'express-validator';


describe('Register DTO validation', ()=>{
    let app;
    before(()=>{
        app = express();
        app.use(express.json());

        app.post('/register', registerValidation, (res, req)=>{
            const errors = validationResult(req);
            if (!errors){
                return res.status(422).json({
                    errors: errors.array()
                })
            }res.sendStatus(200);
        })
    })

    test('should reject invalid email', async ()=>{
        const res = await request(app).post('/register').send({
            email: 'test',
            password: 'motDePasse',
            firstName: 'Florent',
            lastName: 'BOUDZOUMOU'
        })
        assert.strictEqual(res.status, 422);
    })
})