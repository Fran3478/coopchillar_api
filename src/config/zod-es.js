import { z } from 'zod';

const zodEsMap = (issue, ctx) => {
  const fallback = ctx?.defaultError ?? 'Dato inválido';

  switch (issue.code) {
    case 'invalid_type': {
      if (issue.received === 'undefined') return { message: 'Campo requerido' };
      const exp = typeof issue.expected === 'string' ? issue.expected : 'tipo válido';
      return { message: `Tipo inválido: se esperaba ${exp}` };
    }

    case 'invalid_string': {
      if (issue.validation === 'email') return { message: 'Debe ser un correo válido' };
      if (issue.validation === 'url') return { message: 'Debe ser una URL válida' };
      if (issue.validation === 'uuid') return { message: 'Debe ser un UUID válido' };
      return { message: 'Texto inválido' };
    }

    case 'invalid_enum_value': {
      const opts = (issue.options ?? issue.expected ?? []).map(o => `"${o}"`).join(' | ');
      return { message: `Opción inválida: se esperaba ${opts}` };
    }

    case 'too_small': {
      if (issue.type === 'string') return { message: `Debe tener al menos ${issue.minimum} caracteres` };
      if (issue.type === 'number') return { message: `Debe ser mayor o igual a ${issue.minimum}` };
      if (issue.type === 'array') return { message: `Debe tener al menos ${issue.minimum} elementos` };
      return { message: 'Valor demasiado pequeño' };
    }

    case 'too_big': {
      if (issue.type === 'string') return { message: `Debe tener como máximo ${issue.maximum} caracteres` };
      if (issue.type === 'number') return { message: `Debe ser menor o igual a ${issue.maximum}` };
      if (issue.type === 'array') return { message: `Debe tener como máximo ${issue.maximum} elementos` };
      return { message: 'Valor demasiado grande' };
    }

    case 'invalid_date': return { message: 'Fecha inválida' };
    case 'not_multiple_of': return { message: `Debe ser múltiplo de ${issue.multipleOf}` };
    case 'custom': return { message: issue.message ?? fallback };

    default: return { message: fallback };
  }
};

z.setErrorMap(zodEsMap);
