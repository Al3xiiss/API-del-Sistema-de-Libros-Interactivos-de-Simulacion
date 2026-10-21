// Controlador de autenticación: recibe la petición, llama al servicio y responde

import * as authService from '../services/auth.service.js';

// POST /api/auth/register
export async function registro(req, res) {
  const usuario = await authService.registrar(req.body);
  res.status(201).json({ data: usuario });
}

// POST /api/auth/login
export async function login(req, res) {
  const resultado = await authService.iniciarSesion(req.body);
  res.status(200).json({ data: resultado });
}

// GET /api/auth/me (requiere token)
export async function perfil(req, res) {
  const usuario = await authService.buscarPorId(req.usuario.id);
  res.status(200).json({ data: usuario });
}