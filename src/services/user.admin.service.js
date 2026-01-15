import bcrypt from "bcryptjs";
import * as userRepo from '../repositories/user.repo.js';
import * as tokenRepo from '../repositories/recoveryToken.repo.js';
import * as sessionRepo from '../repositories/session.repo.js';
import { ROLE_RANK, isHigherOrEqualRole, isHigherRole } from "../utils/roles.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../utils/errors.js";

export async function updateEmail({ actor, tenantId, targetUserId, email }) {
    if (!['admin','owner'].includes(actor.role)) {
        throw new ForbiddenError('Permiso denegado');
    }
    const target = await userRepo.findById({ id: targetUserId, tenantId });
    if (!target) throw new NotFoundError('Usuario no encontrado');

    try {
        await userRepo.updateEmail({ userId: target.id, tenantId, email });
    } catch (e) {
        if (e?.name === 'SequelizeUniqueConstraintError') {
            throw new BadRequestError('El correo ya está en uso en esta cooperativa');
        }
        throw(e);
    }
    return { ok: true };
}

export async function changeRole({ actor, tenantId, targetUserId, newRole }) {
    if (!['admin', 'owner'].includes(actor.role)) {
        throw new ForbiddenError('Permiso denegado');
    }
    const target = await userRepo.findById({ id: targetUserId, tenantId });
    if (!target) throw new NotFoundError('Usuario no encontrado');
    if (isHigherRole(newRole, actor.role)) {
        throw new ForbiddenError('No podés asignar un rol superior al tuyo');
    }
    if (actor.role === 'admin' && newRole === 'owner') {
        throw new ForbiddenError('Un admin no puede otorgar rol owner');
    }
    if (actor.id === target.id) {
        if (actor.role === 'admin' && newRole === 'owner') {
            throw new ForbiddenError('Un admin no puede hacerse owner a sí mismo');
        }
        if (actor.role === 'owner' && newRole !== 'owner') {
            const count = await userRepo.countActiveOwnersExcluding({ tenantId, excludeUserId: actor.id });
            if (count === 0) throw new ForbiddenError('No podés dejar a la coop sin otro owner activo');
        }
    } else {
        if (target.role === 'owner' && actor.role !== 'owner') {
            throw new ForbiddenError('Solo otro owner puede modificar a un owner');
        }
    }
    if (target.role === 'owner' && newRole !== 'owner') {
        const count = await userRepo.countActiveOwnersExcluding({ tenantId, excludeUserId: target.id });
        if (count === 0) throw new ForbiddenError('No se puede remover el último owner activo de la coop');
    }
    
    await userRepo.updateRole({ userId: target.id, tenantId, role: newRole });

    await sessionRepo.revokeAllForUser({ userId: target.id });

    return { ok: true };
}

export async function setStatus({ actor, tenantId, targetUserId, status }) {
    if (!['admin', 'owner'].includes(actor.role)) {
        throw new ForbiddenError('Permiso denegado');
    }
    if (!['active', 'blocked'].includes(status)) {
        throw new BadRequestError('Estado inválido');
    }
    const target = await userRepo.findById({ id: targetUserId, tenantId });
    if (!target) throw new NotFoundError('Usuario no encontrado');

    if (status === 'blocked' && target.role === 'owner' && actor.role !== 'owner' && actor.id !== target.id) {
        throw new ForbiddenError('Solo un owner puede bloquear otro owner');
    }

    if (status === 'blocked' && target.role === 'owner') {
        const count = await userRepo.countActiveOwnersExcluding({ tenantId, excludeUserId: target.id });
        if (count === 0) throw new ForbiddenError('No se puede bloquear al último owner activo de la coop');
    }

    await userRepo.updateStatus({ userId: target.id, tenantId, status });

    if (status === 'blocked') {
        await sessionRepo.revokeAllForUser({ userId: target.id });
    }
    return { ok: true };
}

export async function createUserWithOnboarding({ actor, tenantId, email, role, onboardingTtlMinutes = 15 }) {
    if (!['admin', 'owner'].includes(actor.role)) {
        throw new ForbiddenError('No tenés permisos para crear usuarios');
    }
    if (isHigherRole(role, actor.role)) {
        throw new ForbiddenError('No podés crear usuarios con rol superior al tuyo');
    }
    if (actor.role === 'admin' && role === 'owner') {
        throw new ForbiddenError('Un admin no puede crear usuarios con rol owner');
    }
    const randomPass = (Math.random() + 1).toString(36).slice(-12);
    const passwordHash = await bcrypt.hash(randomPass, 12);
    let user;
    try {
        user = await userRepo.createUser({ tenantId, email, passwordHash, role, status: 'active' });
    } catch (e) {
        if (e?.name === 'SequelizeUniqueConstraintError') {
            throw new BadRequestError('El correo ya está en uso en esta cooperativa');
        }
        throw e;
    }
    const { token, expiresAt } = await tokenRepo.createForUser({
        userId: user.id,
        tenantId,
        requestedByUserId: actor.id,
        ttlMinutes: onboardingTtlMinutes,
        ip: null, ua: null,
        purpose: 'onboarding'
    });
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        onboarding: { token, expiresAt }
    };
}