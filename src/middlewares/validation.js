import { z } from "zod";

export const validateUserUpdate = (req, res, next) => {
  const schema = z.object({
    email: z
      .string()
      .email("Format d'email invalide")
      .optional()
      .transform((val) => (val ? val.toLowerCase() : val)),

    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères")
      .max(50, "Le prénom ne peut pas dépasser 50 caractères")
      .optional(),

    lastName: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(50, "Le nom ne peut pas dépasser 50 caractères")
      .optional(),
  });

  try {
    const validatedData = schema.parse(req.body);
    req.validatedData = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    return next(error);
  }
};
