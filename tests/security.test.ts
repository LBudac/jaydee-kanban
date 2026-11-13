import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('Sécurité', () => {
  it('ajoute les en-têtes de helmet et masque X-Powered-By', async () => {
    const res = await request(app).get('/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('refuse une route protégée sans jeton (401)', async () => {
    const res = await request(app).get('/api/ofs');
    expect(res.status).toBe(401);
  });

  it('refuse un jeton falsifié (401)', async () => {
    const res = await request(app)
      .get('/api/columns')
      .set('Authorization', 'Bearer faux.jeton.signature');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid or expired token' });
  });
});