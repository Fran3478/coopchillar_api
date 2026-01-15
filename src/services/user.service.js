import * as userRepo from '../repositories/user.repo.js';

export async function listUsers({ tenantId, q, role, status, page = 1, pageSize = 20 }) {
    const { count, rows } = await userRepo.listUsers({ tenantId, q, role, status, page, pageSize });
    
    const items = rows.map(u => (u.get ? u.get() : u));
    return { total: count, items };
}