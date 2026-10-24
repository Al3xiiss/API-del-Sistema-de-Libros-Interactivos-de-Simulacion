/** Gestión de personajes (RF-10, RF-11 y RF-12). Ver: cualquier usuario con sesión. Crear, editar y eliminar: Administrador. */
import { Character } from '../types';
import { apiDelete, apiGet, apiPost, apiPut, orUndefined, path } from './api';
import { PersonajeApi, toCharacter } from './mappers';

export async function getCharacters(): Promise<Character[]> {
  const personajes = await apiGet<PersonajeApi[]>('/personajes');
  return personajes.map(toCharacter);
}

export async function getCharacter(id: string): Promise<Character | undefined> {
  if (!id) return undefined; // simulación sin personaje asignado
  const personaje = await orUndefined(apiGet<PersonajeApi>(path('/personajes', id)));
  return personaje && toCharacter(personaje);
}

export async function saveCharacter(input: Omit<Character, 'id'> & { id?: string }): Promise<void> {
  const body = {
    capitulo_id: Number(input.chapterId),
    nombre: input.name,
    descripcion: input.description,
    atributos: input.attributes,
  };
  if (input.id) {
    await apiPut(path('/personajes', input.id), body);
  } else {
    await apiPost('/personajes', body);
  }
}

export const deleteCharacter = (id: string) => apiDelete(path('/personajes', id));
