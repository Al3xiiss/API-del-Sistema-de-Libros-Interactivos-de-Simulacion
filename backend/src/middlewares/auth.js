// verificar el token JWT y revisar el rol del usuario

import jwt from 'jsonwebtoken';

// 401 si no viene token o no es válido. Si es válido, deja { id, rol } en req.usuario
export function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Debes iniciar sesión' });
  }

  let datos;
  try {
    datos = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o expirada. Vuelve a iniciar sesión' });
  }

  req.usuario = { id: datos.id, rol: datos.rol };
  next();
}

// 403 si el rol del usuario no está entre los permitidos
// EJ: router.post('/', verificarToken, permitirRoles('admin'), crearLibro);
export function permitirRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario?.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
    }
    next();
  };
}