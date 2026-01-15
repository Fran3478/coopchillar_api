export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Solicitud inválida', details) {
    super(400, 'bad_request', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(401, 'unauthorized', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Prohibido') {
    super(403, 'forbidden', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'No encontrado') {
    super(404, 'not_found', message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto') {
    super(409, 'conflict', message);
  }
}

export class UnprocessableError extends AppError {
  constructor(message = 'Entidad no procesable', details) {
    super(422, 'unprocessable', message, details);
  }
}

export class InternalError extends AppError {
  constructor(message = 'Error interno') {
    super(500, 'internal_error', message);
  }
}
