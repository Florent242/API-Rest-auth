// scripts/create-test-user.js
import prisma from '../src/lib/prisma.js';
import bcrypt from 'bcrypt';

async function createTestUser() {
  try {
    console.log('👤 Création utilisateur test...');
    
    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // Crée l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'Jean',
        lastName: 'Dupont'
      }
    });
    
    console.log('✅ Utilisateur créé:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Nom:', user.firstName, user.lastName);
    
    // Crée un token de test
    console.log('\n🔑 Création token de test...');
    
    return user.id;
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();