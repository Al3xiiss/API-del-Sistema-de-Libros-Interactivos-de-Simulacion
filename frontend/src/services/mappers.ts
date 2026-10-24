/**
 * Traducción entre la API (nombres en español, ids numéricos) y los tipos del frontend.
 * Al estar en un solo lugar, las pantallas siguen usando los mismos tipos que en la EP1.
 */
import { Book, Chapter, Character, ProgressStore, Resource, Role, Simulation, User } from '../types';

// ---------- Formas en que responde la API ----------

export interface UsuarioApi { id: number; alias: string; email: string; rol: Role }

export interface LibroApi {
  id: number; titulo: string; sinopsis: string; color_portada: string; total_capitulos: number;
}

export interface CapituloApi {
  id: number; libro_id: number; numero: number; titulo: string;
  contenido?: string; simulacion_id: number | null; total_recursos: number;
}

export interface PersonajeApi {
  id: number; capitulo_id: number; nombre: string; descripcion: string | null; atributos: string | null;
}

export interface OpcionApi { id: number; texto: string; descripcion: string | null; consecuencia: string }

export interface SimulacionApi {
  id: number; capitulo_id: number; personaje_id: number | null;
  contexto: string; pregunta: string; opciones?: OpcionApi[];
}

export interface RecursoApi {
  id: number; capitulo_id: number; tipo: 'video' | 'audio'; titulo: string;
  descripcion: string | null; url: string | null; duracion_segundos: number | null;
}

export interface ProgresoLibroApi {
  libro_id: number; capitulos_completados: number[]; ultimo_capitulo_id: number | null;
  decisiones: Record<string, number>; actualizado_en: string;
}

// ---------- API → frontend ----------

export const toUser = (u: UsuarioApi): User => ({ id: String(u.id), alias: u.alias, email: u.email, role: u.rol });

export const toBook = (l: LibroApi): Book => ({
  id: String(l.id),
  title: l.titulo,
  synopsis: l.sinopsis,
  coverColor: l.color_portada,
  chapterCount: l.total_capitulos,
});

// El contenido se guarda como texto; cada salto de línea separa un párrafo.
export const toChapter = (c: CapituloApi): Chapter => ({
  id: String(c.id),
  bookId: String(c.libro_id),
  number: c.numero,
  title: c.titulo,
  paragraphs: (c.contenido ?? '').split(/\n+/).map((p) => p.trim()).filter(Boolean),
  simulationId: c.simulacion_id ? String(c.simulacion_id) : undefined,
  resourceCount: c.total_recursos,
});

export const toCharacter = (p: PersonajeApi): Character => ({
  id: String(p.id),
  chapterId: String(p.capitulo_id),
  name: p.nombre,
  description: p.descripcion ?? '',
  attributes: p.atributos ?? '',
});

export const toSimulation = (s: SimulacionApi): Simulation => ({
  id: String(s.id),
  chapterId: String(s.capitulo_id),
  characterId: s.personaje_id ? String(s.personaje_id) : '',
  context: s.contexto,
  question: s.pregunta,
  options: (s.opciones ?? []).map((o) => ({
    id: String(o.id),
    label: o.texto,
    description: o.descripcion ?? '',
    outcome: o.consecuencia,
  })),
});

export const toResource = (r: RecursoApi): Resource => ({
  id: String(r.id),
  chapterId: String(r.capitulo_id),
  type: r.tipo,
  title: r.titulo,
  description: r.descripcion ?? '',
  url: r.url ?? undefined,
  durationSeconds: r.duracion_segundos ?? 0,
});

// La API entrega una lista por libro; el frontend usa un objeto { libroId: progreso }.
export function toProgressStore(libros: ProgresoLibroApi[]): ProgressStore {
  const store: ProgressStore = {};
  for (const libro of libros) {
    store[String(libro.libro_id)] = {
      completedChapterIds: libro.capitulos_completados.map(String),
      lastChapterId: libro.ultimo_capitulo_id ? String(libro.ultimo_capitulo_id) : undefined,
      decisions: Object.fromEntries(
        Object.entries(libro.decisiones).map(([simulacionId, opcionId]) => [simulacionId, String(opcionId)]),
      ),
      updatedAt: libro.actualizado_en,
    };
  }
  return store;
}
