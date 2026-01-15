import { ZodError } from 'zod';
import {
  AppError, InternalError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, BadRequestError, UnprocessableError
} from '../utils/errors.js';

function normalizeError(err) {
  if (err instanceof ZodError) {
    const details = err.issues.map(i => ({
      field: i.path.join('.'),
      message: i.message
    }));
    return new BadRequestError('Datos inválidos', details);
  }

  if (err?.name === 'TokenExpiredError') return new UnauthorizedError('Token expirado');
  if (err?.name === 'JsonWebTokenError') return new UnauthorizedError('Token inválido');

  const name = err?.name;
  if (name === 'SequelizeUniqueConstraintError') {
    const msg = err?.errors?.[0]?.message || 'Recurso duplicado';
    return new ConflictError(msg);
  }
  if (name === 'SequelizeForeignKeyConstraintError') {
    return new ConflictError('Relación inválida (FK)');
  }
  if (name === 'SequelizeValidationError') {
    const details = err?.errors?.map(e => ({ field: e.path, message: e.message }));
    return new UnprocessableError('Validación de datos fallida', details);
  }

  if (err instanceof AppError) return err;

  return new InternalError(process.env.NODE_ENV === 'development' ? (err.message || 'Error') : 'Error interno');
}

export default function errorHandler(err, _req, res, _next) {
  const e = normalizeError(err);

  if (process.env.NODE_ENV !== 'test') {
    console.error('[ERROR]', {
      status: e.status, code: e.code, message: e.message,
      details: e.details, stack: err?.stack
    });
  }

  res.status(e.status).json({
    error: { code: e.code, message: e.message, ...(e.details ? { details: e.details } : {}) }
  });
}
