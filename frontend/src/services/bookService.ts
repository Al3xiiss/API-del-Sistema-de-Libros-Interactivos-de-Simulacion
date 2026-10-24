/**
 * Libros, capítulos, simulaciones y recursos (RF-01 a RF-05 y RF-07).
 * EP2: cada función llama a la API REST y devuelve los mismos tipos que usaban las pantallas en la EP1.
 */
import { Book, Chapter, Resource, Simulation } from '../types';
import { apiDelete, apiGet, apiPost, apiPut, orUndefined, path } from './api';
import {
  CapituloApi, LibroApi, RecursoApi, SimulacionApi, toBook, toChapter, toResource, toSimulation,
} from './mappers';

// ---------- Libros ----------

export async function getBooks(): Promise<Book[]> {
  const libros = await apiGet<LibroApi[]>('/libros');
  return libros.map(toBook);
}

export async function getBook(id: string): Promise<Book | undefined> {
  const libro = await orUndefined(apiGet<LibroApi>(path('/libros', id)));
  return libro && toBook(libro);
}

/** Crea (sin id) o actualiza (con id) un libro. Solo Administrador. */
export async function saveBook(input: { id?: string; title: string; synopsis: string }): Promise<Book> {
  const body = { titulo: input.title, sinopsis: input.synopsis };
  const libro = input.id
    ? await apiPut<LibroApi>(path('/libros', input.id), body)
    : await apiPost<LibroApi>('/libros', body);
  return toBook(libro);
}

export const deleteBook = (id: string) => apiDelete(path('/libros', id));

// ---------- Capítulos ----------

/** Capítulos de un libro, ordenados por número. */
export async function getChapters(bookId: string): Promise<Chapter[]> {
  const capitulos = await apiGet<CapituloApi[]>('/capitulos', { libro_id: bookId });
  return capitulos.map(toChapter);
}

export async function getAllChapters(): Promise<Chapter[]> {
  const capitulos = await apiGet<CapituloApi[]>('/capitulos');
  return capitulos.map(toChapter);
}

export async function getChapter(id: string): Promise<Chapter | undefined> {
  const capitulo = await orUndefined(apiGet<CapituloApi>(path('/capitulos', id)));
  return capitulo && toChapter(capitulo);
}

// ---------- Simulaciones ----------

export async function getSimulation(id: string): Promise<Simulation | undefined> {
  const simulacion = await orUndefined(apiGet<SimulacionApi>(path('/simulaciones', id)));
  return simulacion && toSimulation(simulacion);
}

/** Simulaciones de un libro, para el contador "Decisión X de Y". */
export async function getSimulations(bookId: string): Promise<Simulation[]> {
  const simulaciones = await apiGet<SimulacionApi[]>('/simulaciones', { libro_id: bookId });
  return simulaciones.map(toSimulation);
}

// ---------- Recursos ----------

/** Recursos multimedia; si se indica capítulo, solo los de ese capítulo. */
export async function getResources(chapterId?: string): Promise<Resource[]> {
  const recursos = await apiGet<RecursoApi[]>('/recursos', chapterId ? { capitulo_id: chapterId } : undefined);
  return recursos.map(toResource);
}
