import { ZodError } from 'zod';

export const validate = (schema, where = 'body') => (req, _res, next) => {
  try {
    const src = req[where];
    const normalized = (src == null || (typeof src === 'string' && src.trim() === ''))
      ? {}
      : src;

    const data = schema.parse(normalized);
    req.validated ??= {};
    req.validated[where] = data;
    next();
  } catch (e) {
    next(e);
  }
  // const result = schema.safeParse(req[where]);
  // if (!result.success) return next(result.error);
  // req.validated ??= {};
  // req.validated[where] = result.data;
  // next();
};
