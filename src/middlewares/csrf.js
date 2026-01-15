export function requireCsrf(allowedOrigins = []) {
  return (req, res, next) => {
    const origin = req.get('origin');
    const tokenHeader = req.get('x-csrf-token');
    const tokenCookie = req.cookies?.csrf;

    if (origin && !allowedOrigins.includes(origin)) {
      return res.status(403).json({ error: { code: 'forbidden', message: 'Origen no permitido' }});
    }
    if (!tokenHeader || !tokenCookie || tokenHeader !== tokenCookie) {
      return res.status(403).json({ error: { code: 'forbidden', message: 'CSRF inválido' }});
    }
    next();
  };
}