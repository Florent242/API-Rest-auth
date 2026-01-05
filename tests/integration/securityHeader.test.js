import { describe, test, expect, beforeAll } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import cors from 'cors';
import helmet from 'helmet';

describe('Security Headers (CORS + Helmet)', () => {
  let app;
  
  beforeAll(() => {
    app = express();
    app.use(cors());
    app.use(helmet());
    app.get('/', (req, res) => res.send('OK'));
  });

  test('should have CORS headers', async () => {
    const res = await request(app).get('/');
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
  
  test('should have security headers from Helmet', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-content-type-options']).toBeDefined();
    expect(res.headers['x-frame-options']).toBeDefined();
  });
});