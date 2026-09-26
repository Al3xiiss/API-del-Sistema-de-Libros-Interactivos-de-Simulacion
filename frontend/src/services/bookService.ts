/**
 * Libros, capítulos, simulaciones y recursos (RF-01, RF-02, RF-03, RF-05).
 * Las funciones son async para que en la EP2 solo cambie su interior por fetch.
 */
import { BOOKS, CHAPTERS, RESOURCES, SIMULATIONS } from '../data/mockData';
import { Book, Chapter, Resource, Simulation } from '../types';
import { createId, delay, readJSON, writeJSON } from './storage';

const BOOKS_KEY = 'li.books';
const COVER_COLORS = ['#5B4A8B', '#3F6E55', '#3A6EA5', '#7A4E6E'];

const readBooks = () => readJSON<Book[]>(BOOKS_KEY, BOOKS);

export const chaptersOf = (bookId: string) =>
  CHAPTERS.filter((c) => c.bookId === bookId).sort((a, b) => a.number - b.number);

export async function getBooks(): Promise<Book[]> {
  await delay();
  return readBooks();
}

export async function getBook(id: string): Promise<Book | undefined> {
  await delay(200);
  return readBooks().find((b) => b.id === id);
}

/** Crea (sin id) o actualiza (con id) un libro. Solo Administrador. */
export async function saveBook(input: { id?: string; title: string; synopsis: string }): Promise<Book> {
  await delay();
  const books = readBooks();
  if (input.id) {
    const updated = books.map((b) => (b.id === input.id ? { ...b, ...input } as Book : b));
    writeJSON(BOOKS_KEY, updated);
    return updated.find((b) => b.id === input.id)!;
  }
  const book: Book = {
    id: createId('b'),
    title: input.title,
    synopsis: input.synopsis,
    coverColor: COVER_COLORS[books.length % COVER_COLORS.length],
  };
  writeJSON(BOOKS_KEY, [...books, book]);
  return book;
}

export async function deleteBook(id: string): Promise<void> {
  await delay();
  writeJSON(BOOKS_KEY, readBooks().filter((b) => b.id !== id));
}

export async function getChapters(bookId: string): Promise<Chapter[]> {
  await delay(200);
  return chaptersOf(bookId);
}

export async function getChapter(id: string): Promise<Chapter | undefined> {
  await delay(200);
  return CHAPTERS.find((c) => c.id === id);
}

export const getAllChapters = async (): Promise<Chapter[]> => CHAPTERS;

export async function getSimulation(id: string): Promise<Simulation | undefined> {
  await delay(200);
  return SIMULATIONS.find((s) => s.id === id);
}

/** Simulaciones de un libro, para el contador "Decisión X de Y". */
export const simulationsOfBook = (bookId: string) => {
  const chapterIds = chaptersOf(bookId).map((c) => c.id);
  return SIMULATIONS.filter((s) => chapterIds.includes(s.chapterId));
};

/** Recursos multimedia; si se indica capítulo, solo los de ese capítulo. */
export async function getResources(chapterId?: string): Promise<Resource[]> {
  await delay(700);
  return chapterId ? RESOURCES.filter((r) => r.chapterId === chapterId) : RESOURCES;
}

export const hasResources = (chapterId: string) => RESOURCES.some((r) => r.chapterId === chapterId);
