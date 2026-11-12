/** Estadísticas del panel de administración (solo Administrador). */
import { apiGet } from './api';

export interface AdminStats {
  books: number;
  chapters: number;
  characters: number;
  patients: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const data = await apiGet<{ libros: number; capitulos: number; personajes: number; pacientes: number }>('/estadisticas');
  return { books: data.libros, chapters: data.capitulos, characters: data.personajes, patients: data.pacientes };
}
