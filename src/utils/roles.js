export const ROLE_RANK = { viewer: 1, editor: 2, admin: 3, owner: 4 };

export function isHigherOrEqualRole(a,b) {
    return ROLE_RANK[a] >= ROLE_RANK[b];
}

export function isHigherRole(a,b) {
    return ROLE_RANK[a] > ROLE_RANK[b];
}