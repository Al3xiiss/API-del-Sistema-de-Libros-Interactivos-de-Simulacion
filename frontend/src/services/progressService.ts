/**
 * Progreso del paciente (RF-06 y RF-08).
 * La API identifica al paciente por su token, así cada uno solo ve y modifica su propio avance.
 */
import { BookProgress, Chapter, ChapterStatus, ProgressStore } from '../types';
import { apiGet, apiPut, path } from './api';
import { ProgresoLibroApi, toProgressStore } from './mappers';

export async function getProgress(): Promise<ProgressStore> {
  const { libros } = await apiGet<{ libros: ProgresoLibroApi[] }>('/progreso');
  return toProgressStore(libros);
}

/** Registra que el paciente abrió el capítulo (para "Continúa donde lo dejaste"). */
export async function markChapterOpened(chapterId: string): Promise<void> {
  await apiPut(path('/progreso/capitulos', chapterId), {});
}

export async function completeChapter(chapterId: string): Promise<void> {
  await apiPut(path('/progreso/capitulos', chapterId), { completado: true });
}

/** Guarda la opción elegida; si ya había decidido en esa simulación, la reemplaza. */
export async function saveDecision(simulationId: string, optionId: string): Promise<void> {
  await apiPut(path('/decisiones', simulationId), { opcion_id: Number(optionId) });
}

/**
 * Un capítulo está disponible si es el primero o si el anterior está completado.
 * `chapters` debe venir ordenado por número.
 */
export function chapterStatus(chapters: Chapter[], index: number, progress?: BookProgress): ChapterStatus {
  const done = progress?.completedChapterIds ?? [];
  if (done.includes(chapters[index].id)) return 'completed';
  if (index === 0 || done.includes(chapters[index - 1].id)) return 'available';
  return 'locked';
}

/** Porcentaje de avance de un libro (0 a 1), para IonProgressBar. */
export const bookPercent = (totalChapters: number, progress?: BookProgress) =>
  totalChapters === 0 ? 0 : (progress?.completedChapterIds.length ?? 0) / totalChapters;
