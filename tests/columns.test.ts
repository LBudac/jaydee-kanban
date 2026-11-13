import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { Column } from '../src/models/Column.js';
import { createTestUser, getAuthToken, createTestColumn } from './helpers.js';

const app = createApp();

describe('Routes /api/columns', () => {
  let token: string;

  // Avant chaque test : un utilisateur et son jeton (setup.ts vide la base après chaque test)
  beforeEach(async () => {
    const user = await createTestUser();
    token = getAuthToken(user);
  });

  describe('GET /api/columns', () => {
    it('renvoie 401 sans jeton', async () => {
      const res = await request(app).get('/api/columns');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'No token provided' });
    });

    it('renvoie 200 et une liste vide quand la base est vide', async () => {
      const res = await request(app)
        .get('/api/columns')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('renvoie les colonnes triées par position', async () => {
      // Arrange : on insère dans le désordre
      await createTestColumn('Terminé', 2);
      await createTestColumn('À faire', 0);

      // Act
      const res = await request(app)
        .get('/api/columns')
        .set('Authorization', `Bearer ${token}`);

      // Assert : code HTTP, format et contenu
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/json/);
      expect(res.body).toHaveProperty('message', 'Columns retrieved successfully');
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]).toMatchObject({ name: 'À faire', position: 0 });
      expect(res.body.data[0]).toHaveProperty('_id');
    });
  });

  describe('POST /api/columns', () => {
    it('crée une colonne (201) et l’enregistre en base', async () => {
      const res = await request(app)
        .post('/api/columns')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'En production' });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Column created successfully');
      expect(res.body.data).toMatchObject({ name: 'En production', position: 0 });

      // Effet en base : le document existe vraiment
      const enBase = await Column.findById(res.body.data._id);
      expect(enBase).not.toBeNull();
      expect(enBase?.name).toBe('En production');
    });

    it('place la nouvelle colonne après la dernière', async () => {
      await createTestColumn('À faire', 0);

      const res = await request(app)
        .post('/api/columns')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'En cours' });

      expect(res.status).toBe(201);
      expect(res.body.data.position).toBe(1);
    });

    it('renvoie 400 si le nom est vide, sans rien insérer', async () => {
      const res = await request(app)
        .post('/api/columns')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation error');
      expect(await Column.countDocuments()).toBe(0);
    });

    it('renvoie 400 si le nom existe déjà', async () => {
      await Column.init(); // attend la création de l'index unique sur "name"
      await createTestColumn('À faire', 0);

      const res = await request(app)
        .post('/api/columns')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'À faire' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Duplicate entry');
    });

    it('renvoie 401 sans jeton et n’insère rien', async () => {
      const res = await request(app).post('/api/columns').send({ name: 'Pirate' });

      expect(res.status).toBe(401);
      expect(await Column.countDocuments()).toBe(0);
    });
  });
});