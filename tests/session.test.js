import prisma from "../src/lib/prisma";
import { SessionService } from "../src/services/session.service";

describe("Gestion des Sessions (Personne 3)", () => {
  
  // Avant chaque test, on vide la base de données pour repartir à neuf
  beforeAll(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  test("Doit créer un RefreshToken pour un utilisateur", async () => {
    // 1. On crée d'abord un utilisateur (car un badge appartient à quelqu'un)
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        password: "password_haché_ici"
      }
    });

    // 2. On prépare les données du badge
    const tokenData = {
      token: "mon-super-token-secret-123",
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) // Expire dans 1 jour
    };

    // 3. On appelle le service
    const savedToken = await SessionService.createRefreshToken(tokenData);

    // 4. On vérifie que ça a marché
    expect(savedToken).toBeDefined(); // Est-ce que l'objet existe ?
    expect(savedToken.token).toBe(tokenData.token); // Est-ce que c'est le bon texte ?
    expect(savedToken.userId).toBe(user.id); // Est-ce qu'il appartient au bon utilisateur ?
  });
});