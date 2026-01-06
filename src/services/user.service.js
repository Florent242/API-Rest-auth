import { z } from 'zod';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient} from '@prisma/client';
const adapter = new PrismaBetterSqlite3({url: process.env.DATABASE_URL});
const prisma = new PrismaClient({adapter});


  // GET /user/profile
  const getUserProfile = async (userId) => {
    try {
      const user = await prisma.user.findUnique({
        where: { 
          id: userId,
          disabledAt: null 
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          emailVerifiedAt: true,
          twoFactorEnabledAt: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé ou compte désactivé');
      }

      return user;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du profil: ${error.message}`);
    }
  }

  // PUT /user/profile
  const updateUserProfile = async (userId, updateData) => {
    try {
      // Validation des données
      const schema = z.object({
        email: z.string().email().optional(),
        firstName: z.string().min(2).max(50).optional(),
        lastName: z.string().min(2).max(50).optional(),
      });

      const validatedData = schema.parse(updateData);

      // Vérifier si l'email est déjà utilisé
      if (validatedData.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: validatedData.email,
            id: { not: userId },
            disabledAt: null
          }
        });

        if (existingUser) {
          throw new Error('Cet email est déjà utilisé par un autre compte actif');
        }
      }

      // Mettre à jour l'utilisateur
      const updatedUser = await prisma.user.update({
        where: { 
          id: userId,
          disabledAt: null 
        },
        data: validatedData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          updatedAt: true,
        }
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw new Error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    }
  }

  // DELETE /user/account (soft delete)
  const deleteUserAccount = async (userId) => {
    try {
      // Vérifier si l'utilisateur existe et n'est pas déjà désactivé
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      if (user.disabledAt) {
        throw new Error('Le compte est déjà désactivé');
      }

      // Soft delete
      const disabledUser = await prisma.user.update({
        where: { id: userId },
        data: { 
          disabledAt: new Date(),
          // Optionnel: supprimer les tokens actifs
          refreshTokens: {
            updateMany: {
              where: { revokedAt: null },
              data: { revokedAt: new Date() }
            }
          }
        },
        select: {
          id: true,
          disabledAt: true,
        }
      });

      return {
        message: 'Compte désactivé avec succès',
        disabledAt: disabledUser.disabledAt
      };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du compte: ${error.message}`);
    }
  }

export default {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
};
