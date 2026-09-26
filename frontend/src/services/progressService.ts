/**
 * Progreso del paciente (RF-04 y RF-06). Cada usuario tiene su propio registro,
 * así un paciente solo ve sus métricas.
 */
import { DEMO_PROGRESS } from '../data/mockData';
import { BookProgress, Chapter, ChapterStatus, ProgressStore } from '../types';
import { delay, readJSON, writeJSON } from './storage';

const keyFor = (userId: string) => `li.progress.${userId}`;

const read = (userId: string): ProgressStore =>
  readJSON<ProgressStore>(keyFor(userId), userId === 'u-paciente' ? DEMO_PROGRESS : {});

const emptyProgress = (): BookProgress => ({ completedChapterIds: [], decisions: {}, updatedAt: '' });

/** Aplica un cambio al progreso de un libro y lo guarda. */
function update(userId: string, bookId: string, change: (p: BookProgress) => BookProgress) {
  const store = read(userId);
  const next = change(store[bookId] ?? emptyProgress());
  writeJSON(keyFor(userId), { ...store, [bookId]: { ...next, updatedAt: new Date().toISOString() } });
}

export async function getProgress(userId: string): Promise<ProgressStore> {
  await delay(200);
  return read(userId);
}

export const markChapterOpened = (userId: string, bookId: string, chapterId: string) =>
  update(userId, bookId, (p) => ({ ...p, lastChapterId: chapterId }));

export const completeChapter = (userId: string, bookId: string, chapterId: string) =>
  update(userId, bookId, (p) => ({
    ...p,
    completedChapterIds: p.completedChapterIds.includes(chapterId)
      ? p.completedChapterIds
      : [...p.completedChapterIds, chapterId],
  }));

export const saveDecision = (userId: string, bookId: string, simulationId: string, optionId: string) =>
  update(userId, bookId, (p) => ({ ...p, decisions: { ...p.decisions, [simulationId]: optionId } }));

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
