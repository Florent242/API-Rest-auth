import { ValidationException } from './exceptions.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(422).json({
      errors: result.error.errors,
    });
  }

  req.validatedBody = result.data;
  next();
};

export const validateData = (schema, data) => {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const error = new ValidationException(result.error.errors);
    error.statusCode = 422;
    throw error;
  }
  
  return result.data;
};

export default validate;
