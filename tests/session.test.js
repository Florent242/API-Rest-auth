import prisma from "../src/lib/prisma.js";

describe("Test du service de Session (RefreshToken)", () => {
    test("Doit enregistrer un nouveau RefreshToken dans la base de donnees", async () => {
        //1 on prépare des donnees fake pour le test
        const fakeTokenData ={
            token: 'un-fake-token-comme-la-vie-de-florent',
            userdId: '1', //je suppose que lutilisateur nexiste pas encire
            expiresAt: new Date(Date.now() + 1000 * 60 * 60)//dans 1h expire
        };

        //2 on essaie dappeler le futur service (qui nexiste pas encore)
        //pour l'instant on va tester directement avec Prisma pour voir si le modele marche
        const createdToken = await prisma.refreshToken.create({
            data: fakeTokenData
        });

        //3 on verifie si le résultat est correct (Les Expectations)
        expect(createdToken).toBeDefined(); // On verifie que lobjet a bien ete cree
        expect(createdToken.token).toBe(fakeTokenData.token); //on verifie que c'est le bon texte
    });
})