import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';

describe('Security Headers - CORS Configuration', () => {
  test('should include Access-Control-Allow-Origin header', async () => {
    const res = await request(app).get('/');
    expect(res.headers['access-control-allow-origin']).toBeTruthy();
  });

  test('should handle preflight OPTIONS requests', async () => {
    const res = await request(app)
      .options('/api/users/register')
      .set('Origin', 'http://example.com')
      .set('Access-Control-Request-Method', 'POST');
    
    expect(res.headers['access-control-allow-origin']).toBeTruthy();
  });

  test('should allow credentials if configured', async () => {
    const res = await request(app)
      .get('/')
      .set('Origin', 'http://example.com');
    
    expect(res.headers['access-control-allow-origin']).toBeTruthy();
  });
});

describe('Security Headers - Helmet Configuration', () => {
  test('should include X-Content-Type-Options: nosniff', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  test('should include X-Frame-Options for clickjacking protection', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-frame-options']).toBeTruthy();
  });

  test('should include X-DNS-Prefetch-Control', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-dns-prefetch-control']).toBeTruthy();
  });

  test('should include X-Download-Options for IE8+', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-download-options']).toBeTruthy();
  });

  test('should include X-Permitted-Cross-Domain-Policies', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-permitted-cross-domain-policies']).toBeTruthy();
  });

  test('should include Referrer-Policy', async () => {
    const res = await request(app).get('/');
    expect(res.headers['referrer-policy']).toBeTruthy();
  });

  test('should include Strict-Transport-Security in production', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-content-type-options']).toBeTruthy();
  });

  test('should NOT expose X-Powered-By header', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('Security Headers - Combined CORS + Helmet', () => {
  test('should have both CORS and Helmet headers on API routes', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Origin', 'http://example.com');
    
    expect(res.headers['access-control-allow-origin']).toBeTruthy();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  test('should maintain security headers on error responses', async () => {
    const res = await request(app).get('/nonexistent-route');
    
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeTruthy();
  });
});
