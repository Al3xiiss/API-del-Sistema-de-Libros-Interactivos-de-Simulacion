import { checkDatabase } from '../services/health.service.js';

export async function getHealth(req, res) {
  const db = await checkDatabase();
  res.status(200).json({ data: { estado: 'ok', baseDeDatos: db } });
}