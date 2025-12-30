import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import prisma from "#prisma";

passport.use(
  new GitHubStrategy(
{
      // Vérifie bien que ces noms correspondent au .env
      clientID: process.env.GITHUB_CLIENT_ID, 
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const providerId = profile.id.toString();
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("L'email est requis pour l'authentification."), null);
        }

        // 1. Recherche du compte OAuth existant
        let oauthAccount = await prisma.oAuthAccount.findUnique({
          where: { provider_providerId: { provider: "github", providerId } },
          include: { user: true }
        });

        if (oauthAccount) {
          return done(null, oauthAccount.user);
        }

        // 2. Étape 7 & 8 : Recherche par email (Liaison de compte)
        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
          // Si l'user existe, on crée juste la liaison OAuth
          await prisma.oAuthAccount.create({
            data: {
              provider: "github",
              providerId: providerId,
              userId: user.id
            }
          });
        } else {
          // 3. Étape 5 : Création d'un nouvel utilisateur
          const nameParts = (profile.displayName || profile.username).split(" ");
          user = await prisma.user.create({
            data: {
              email,
              firstName: nameParts[0] || "GitHub",
              lastName: nameParts.slice(1).join(" ") || "User",
              password: "", // ATTENTION : Ton schéma exige un password. 
              emailVerifiedAt: new Date(),
              oauthAccounts: {
                create: {
                  provider: "github",
                  providerId: providerId
                }
              }
            }
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;