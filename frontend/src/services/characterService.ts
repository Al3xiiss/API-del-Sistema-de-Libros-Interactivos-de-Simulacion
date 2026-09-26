/** Gestión de personajes (RF-07). Solo Administrador. */
import { CHARACTERS } from '../data/mockData';
import { Character } from '../types';
import { createId, delay, readJSON, writeJSON } from './storage';

const CHARACTERS_KEY = 'li.characters';

const readCharacters = () => readJSON<Character[]>(CHARACTERS_KEY, CHARACTERS);

export async function getCharacters(): Promise<Character[]> {
  await delay();
  return readCharacters();
}

export async function getCharacter(id: string): Promise<Character | undefined> {
  await delay(200);
  return readCharacters().find((c) => c.id === id);
}

export async function saveCharacter(input: Omit<Character, 'id'> & { id?: string }): Promise<void> {
  await delay();
  const list = readCharacters();
  if (input.id) {
    writeJSON(CHARACTERS_KEY, list.map((c) => (c.id === input.id ? ({ ...c, ...input } as Character) : c)));
  } else {
    writeJSON(CHARACTERS_KEY, [...list, { ...input, id: createId('p') }]);
  }
}

export async function deleteCharacter(id: string): Promise<void> {
  await delay();
  writeJSON(CHARACTERS_KEY, readCharacters().filter((c) => c.id !== id));
}
