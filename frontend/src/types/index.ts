/**
 * Tipos del dominio. Reflejan el modelo que tendrá la API REST en la EP2,
 * así el cambio de datos simulados a datos reales no toca las pantallas.
 */

export type Role = 'patient' | 'admin';

/** Usuario en sesión (nunca incluye la contraseña). */
export interface User {
  id: string;
  alias: string;
  email: string;
  role: Role;
}

export interface Book {
  id: string;
  title: string;
  synopsis: string;
  /** Color de la portada provisoria (en la EP2 será una imagen). */
  coverColor: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  number: number;
  title: string;
  paragraphs: string[];
  /** Si el capítulo termina en una simulación, su id. */
  simulationId?: string;
}

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  /** Texto que se muestra después de confirmar la decisión. */
  outcome: string;
}

export interface Simulation {
  id: string;
  chapterId: string;
  characterId: string;
  context: string;
  question: string;
  options: DecisionOption[];
}

export interface Character {
  id: string;
  name: string;
  description: string;
  attributes: string;
  chapterId: string;
}

export interface Resource {
  id: string;
  chapterId: string;
  type: 'video' | 'audio';
  title: string;
  description: string;
  durationSeconds: number;
}

/** Progreso de un paciente en un libro (RF-06). */
export interface BookProgress {
  completedChapterIds: string[];
  lastChapterId?: string;
  /** simulationId -> optionId elegida (RF-04). */
  decisions: Record<string, string>;
  updatedAt: string;
}

/** Progreso de un paciente en todos sus libros: bookId -> progreso. */
export type ProgressStore = Record<string, BookProgress>;

export type ChapterStatus = 'completed' | 'available' | 'locked';
