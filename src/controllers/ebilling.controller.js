import { z } from 'zod';
import * as service from '../services/ebilling.service.js';

const optCoerceStr = z.preprocess(
    v => (v === null || v === '' ? undefined : v),
    z.coerce.string().trim().optional()
);
const reqStrMin1 = z.preprocess(
    v => (v == null ? '' : v),
    z.coerce.string().trim().min(1)
);
const reqStrMin2 = z.preprocess(
    v => (v == null ? '' : v),
    z.coerce.string().trim().min(2)
);
const reqEmail = z.preprocess(
    v => (v == null ? '' : v),
    z.coerce.string().trim().email()
);

export const publicCreateSchema = z.object({
    abonadoNumero: reqStrMin1, // requerido, admite número->string
    dniCuit: z.preprocess(v => (v == null ? '' : v), z.coerce.string().trim().min(7)),
    nombre: reqStrMin2,
    apellido: reqStrMin2,
    email: reqEmail,
    telefono: optCoerceStr
});

export const listSchema = z.object({
    status: z.enum(['pending','resolved']).optional(),
    q: z.coerce.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10)
});

export const statusBodySchema = z.object({ status: z.enum(['pending','resolved']) });

export const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

export async function createPublic(req, res, next) {
    try {
        const tenantId = Number(req.params.tenantId);
        const data = req.validated?.body ?? req.body;
        const meta = { ip: req.ip, ua: req.get('user-agent') };
        const row = await service.createPublic({ tenantId, data, meta });
        res.status(201).json({ id: row.id });
    } catch (e) {
        next(e);
    }
}

export async function list(req, res, next) {
    try {
        const q = req.validated?.query ?? req.query;
        const tenantId = req.user.tenantId;
        const result = await service.list({ tenantId, ...q });
        res.json({ total: result.count, items: result.rows });
    } catch (e) {
        next(e)
    }
}

export async function updateStatus(req, res, next) {
    try {
        const { id } = req.validated?.params ?? {};
        const { status } = req.validated?.body ?? req.body;
        const { tenantId, id: userId } = req.user;
        const row = await service.setStatus({ tenantId, id: Number(id), status, userId });
        if(!row) return res.status(404).json({ error: { code: 'not_found', message: 'Solicitud no encontrada' }});
        res.json({ ok: true });
    } catch (e) {
        next(e);
    }
}