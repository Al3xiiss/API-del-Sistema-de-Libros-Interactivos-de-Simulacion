// Servicio de autenticación: registro, inicio de sesión y datos del usuario
// Todas las consultas usan parametros ($1, etc) para evitar inyección SQL

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';

const COSTO_BCRYPT = 10;

// El token solo lleva el id y el rol.
function generarToken(usuario) {
  return jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  });
}

// Todo registro público crea un paciente. Los administradores no se crean desde la API
export async function registrar({ alias, email, password }) {
  const passwordHash = await bcrypt.hash(password, COSTO_BCRYPT);
  try {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (alias, email, password_hash, rol)
       VALUES ($1, $2, $3, 'patient')
       RETURNING id, alias, email, rol`,
      [alias, email, passwordHash],
    );
    return rows[0];
  } catch (err) {
    // 23505 = PostgreSQL rechazó un valor repetido en una columna UNIQUE
    if (err.code === '23505' && err.constraint === 'usuarios_alias_key') {
      throw new HttpError(409, 'Ese alias ya está en uso. Elige otro.');
    }
    if (err.code === '23505') {
      throw new HttpError(409, 'No pudimos crear la cuenta con ese correo. El correo ya existe');
    }
    throw err;
  }
}

export async function iniciarSesion({ email, password }) {
  const { rows } = await pool.query(
    'SELECT id, alias, email, rol, password_hash FROM usuarios WHERE email = $1',
    [email],
  );
  const usuario = rows[0];
  const passwordCorrecta = usuario ? await bcrypt.compare(password, usuario.password_hash) : false;

  if (!passwordCorrecta) {
    throw new HttpError(401, 'Correo o contraseña incorrectos');
  }

  return {
    token: generarToken(usuario),
    usuario: { id: usuario.id, alias: usuario.alias, email: usuario.email, rol: usuario.rol },
  };
}

export async function buscarPorId(id) {
  const { rows } = await pool.query(
    'SELECT id, alias, email, rol, creado_en FROM usuarios WHERE id = $1',
    [id],
  );
  if (!rows[0]) {
    throw new HttpError(404, 'Usuario no encontrado');
  }
  return rows[0];
}