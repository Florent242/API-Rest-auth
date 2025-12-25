import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from 'supertest';
import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Note : Tu devras peut-être adapter l'import selon ta config
import app from '../src/app.js';

import prisma from "#lib/prisma";

describe('Sprint 1 - User Profile API', () => {
  let testUser;
  let authToken;
  let userId;

  // Avant tous les tests
  beforeAll(async () => {
    // Créer un utilisateur de test
    testUser = await prisma.user.create({
      data: {
        email: 'test.profile@example.com',
        password: '$2b$10$hashedpassword123', // Hash fictif
        firstName: 'Test',
        lastName: 'User'
      }
    });
    
    userId = testUser.id;
    
    // Générer un token JWT pour les tests
    authToken = jwt.sign(
      { userId: userId },
      process.env.JWT_SECRET || 'test-secret-jwt-key-123',
      { expiresIn: '1h' }
    );
  });

  // Après tous les tests
  afterAll(async () => {
    // Nettoyer la base de données
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test.'
        }
      }
    });
    await prisma.$disconnect();
  });

  // ---- TEST 1 : GET /api/users/profile ----
  describe('1. GET /api/users/profile', () => {
    it('doit retourner le profil utilisateur avec un token valide', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('email', 'test.profile@example.com');
      expect(response.body.data).toHaveProperty('firstName', 'Test');
      expect(response.body.data).toHaveProperty('lastName', 'User');
    });

    it('doit retourner 401 sans token d\'authentification', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('doit retourner 404 si l\'utilisateur est désactivé (soft delete)', async () => {
      // Désactiver l'utilisateur d'abord
      await prisma.user.update({
        where: { id: userId },
        data: { disabledAt: new Date() }
      });

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);

      // Réactiver pour les autres tests
      await prisma.user.update({
        where: { id: userId },
        data: { disabledAt: null }
      });
    });
  });

  // ---- TEST 2 : PUT /api/users/profile ----
  describe('2. PUT /api/users/profile', () => {
    it('doit mettre à jour le prénom et nom de l\'utilisateur', async () => {
      const updateData = {
        firstName: 'Jean',
        lastName: 'Dupont'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.firstName).toBe('Jean');
      expect(response.body.data.lastName).toBe('Dupont');
      expect(response.body).toHaveProperty('message', 'Profil mis à jour avec succès');
    });

    it('doit valider le format de l\'email', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'email-invalide' });

      expect(response.status).toBe(400);
      expect(response.body.errors[0]).toHaveProperty('field', 'email');
      expect(response.body.errors[0].message).toContain('Format d\'email invalide');
    });

    it('doit empêcher l\'utilisation d\'un email déjà existant', async () => {
      // Créer un deuxième utilisateur
      const secondUser = await prisma.user.create({
        data: {
          email: 'existant@example.com',
          password: '$2b$10$hashedpassword456',
          firstName: 'Second',
          lastName: 'User'
        }
      });

      // Essayer d'utiliser cet email
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'existant@example.com' });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('email est déjà utilisé');

      // Nettoyer
      await prisma.user.delete({ where: { id: secondUser.id } });
    });

    it('doit valider la longueur du prénom (min 2 caractères)', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'A' }); // Trop court

      expect(response.status).toBe(400);
      expect(response.body.errors[0].message).toContain('au moins 2 caractères');
    });
  });

  // ---- TEST 3 : DELETE /api/users/account ----
  describe('3. DELETE /api/users/account (soft delete)', () => {
    it('doit désactiver le compte (soft delete)', async () => {
      const response = await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.disabledAt).toBeDefined();
      expect(response.body.message).toContain('Compte désactivé');

      // Vérifier en base de données
      const deletedUser = await prisma.user.findUnique({
        where: { id: userId }
      });
      expect(deletedUser.disabledAt).toBeDefined();
      expect(deletedUser.disabledAt).not.toBeNull();
    });

    it('ne doit pas permettre de désactiver un compte déjà désactivé', async () => {
      // Le compte est déjà désactivé du test précédent
      const response = await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('déjà désactivé');
    });

    it('doit retourner 404 pour GET /profile après suppression', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});