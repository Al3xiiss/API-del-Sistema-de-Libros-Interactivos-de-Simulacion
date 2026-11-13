/**
 * Gestión de capítulos, simulaciones y recursos desde el panel de administración (EF).
 * Ver: cualquier usuario con sesión. Crear, editar y eliminar: solo Administrador (la API responde 403 a un paciente).
 * Para leer se reutilizan las funciones de bookService (getChapters, getChapter, getResources...).
 */
import { Resource, Simulation } from '../types';
import { apiDelete, apiGet, apiPost, apiPut, orUndefined, path } from './api';
import { RecursoApi, SimulacionApi, toResource, toSimulation } from './mappers';

// ---------- Capítulos ----------

export interface ChapterInput {
    id?: string;
    bookId: string;
    /** Si no se indica, la API usa el siguiente número disponible del libro. */
    number?: number;
    title: string;
    /** Texto del capítulo. Cada línea en blanco separa un párrafo. */
    content: string;
}

/** Crea (sin id) o actualiza (con id) un capítulo. */
export async function saveChapter(input: ChapterInput): Promise<void> {
    const body = {
        libro_id: Number(input.bookId),
        numero: input.number ?? null,
        titulo: input.title,
        contenido: input.content,
    };
    if (input.id) {
        await apiPut(path('/capitulos', input.id), body);
    } else {
        await apiPost('/capitulos', body);
    }
}

/** También elimina sus personajes, simulación, recursos y el progreso de ese capítulo. */
export const deleteChapter = (id: string) => apiDelete(path('/capitulos', id));

// ---------- Simulaciones ----------

/** La lista de la API no trae las opciones, pero sí cuántas son y datos del capítulo y del personaje. */
interface SimulacionListaApi extends SimulacionApi {
    total_opciones: number;
    libro_id: number;
    capitulo_numero: number;
    capitulo_titulo: string;
    personaje_nombre: string | null;
}

export interface SimulationSummary extends Simulation {
    bookId: string;
    chapterNumber: number;
    chapterTitle: string;
    characterName: string;
    optionCount: number;
}

export async function getAllSimulations(): Promise<SimulationSummary[]> {
    const simulaciones = await apiGet<SimulacionListaApi[]>('/simulaciones');
    return simulaciones.map((s) => ({
        ...toSimulation(s),
        bookId: String(s.libro_id),
        chapterNumber: s.capitulo_numero,
        chapterTitle: s.capitulo_titulo,
        characterName: s.personaje_nombre ?? '',
        optionCount: s.total_opciones,
    }));
}

export interface OptionInput {
    /** Vacío en una opción nueva. */
    id?: string;
    label: string;
    description: string;
    outcome: string;
}

export interface SimulationInput {
    id?: string;
    chapterId: string;
    /** Vacío: la simulación usa un personaje genérico. */
    characterId: string;
    context: string;
    question: string;
    options: OptionInput[];
}

const MIN_OPCIONES = 2;
const MAX_OPCIONES = 4;

const toOptionBody = (option: OptionInput) => ({
    texto: option.label,
    descripcion: option.description || null,
    consecuencia: option.outcome,
});

/**
 * Crea o actualiza una simulación con sus opciones.
 * - Crear: la API guarda la simulación y todas sus opciones en una transacción.
 * - Editar: se actualizan los datos de la simulación y después cada opción con sus propias rutas.
 *   `originalOptionIds` son las opciones que tenía al abrir el formulario, para saber cuáles se quitaron.
 */
export async function saveSimulation(input: SimulationInput, originalOptionIds: string[] = []): Promise<void> {
    const datos = {
        capitulo_id: Number(input.chapterId),
        personaje_id: input.characterId ? Number(input.characterId) : null,
        contexto: input.context,
        pregunta: input.question,
    };

    if (!input.id) {
        await apiPost('/simulaciones', { ...datos, opciones: input.options.map(toOptionBody) });
        return;
    }

    const base = path('/simulaciones', input.id);
    await apiPut(base, datos);

    // 1. Editar las opciones que ya existían
    const existentes = input.options.filter((option) => option.id);
    for (const option of existentes) {
        await apiPut(path(`${base}/opciones`, option.id as string), toOptionBody(option));
    }

    // 2. Eliminar las quitadas y crear las nuevas. La API exige entre 2 y 4 opciones en todo momento,
    //    así que se elimina solo si quedan más de 2 y se crea solo si hay menos de 4.
    const porEliminar = originalOptionIds.filter((id) => !existentes.some((option) => option.id === id));
    const porCrear = input.options.filter((option) => !option.id);
    let total = originalOptionIds.length;
    while (porEliminar.length > 0 || porCrear.length > 0) {
        if (porEliminar.length > 0 && total > MIN_OPCIONES) {
            await apiDelete(path(`${base}/opciones`, porEliminar.shift() as string));
            total -= 1;
        } else if (porCrear.length > 0 && total < MAX_OPCIONES) {
            await apiPost(`${base}/opciones`, toOptionBody(porCrear.shift() as OptionInput));
            total += 1;
        } else {
            break;
        }
    }
}

/** También elimina sus opciones y las decisiones que los pacientes tomaron en ella. */
export const deleteSimulation = (id: string) => apiDelete(path('/simulaciones', id));

// ---------- Recursos multimedia ----------

export async function getResource(id: string): Promise<Resource | undefined> {
    const recurso = await orUndefined(apiGet<RecursoApi>(path('/recursos', id)));
    return recurso && toResource(recurso);
}

export type ResourceInput = Omit<Resource, 'id'> & { id?: string };

export async function saveResource(input: ResourceInput): Promise<void> {
    const body = {
        capitulo_id: Number(input.chapterId),
        tipo: input.type,
        titulo: input.title,
        descripcion: input.description || null,
        url: input.url || null,
        duracion_segundos: input.durationSeconds || null,
    };
    if (input.id) {
        await apiPut(path('/recursos', input.id), body);
    } else {
        await apiPost('/recursos', body);
    }
}

export const deleteResource = (id: string) => apiDelete(path('/recursos', id));