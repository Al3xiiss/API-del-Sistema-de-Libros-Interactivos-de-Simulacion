/**
 * Datos de prueba para la EP1. En la EP2 estos datos vivirán en la base de datos
 * y llegarán desde la API REST.
 */
import { Book, Chapter, Character, ProgressStore, Resource, Simulation, User } from '../types';

/** Usuarios de prueba. La contraseña en texto plano es SOLO para el mock. */
export const DEMO_USERS: Array<User & { password: string }> = [
  { id: 'u-paciente', alias: 'elena_r', email: 'paciente@demo.cl', password: 'Paciente123', role: 'patient' },
  { id: 'u-admin', alias: 'martin_admin', email: 'admin@demo.cl', password: 'Admin12345', role: 'admin' },
];

export const BOOKS: Book[] = [
  {
    id: 'b1',
    title: 'El misterio de Valparaíso',
    synopsis:
      'Ana recorre los cerros de Valparaíso siguiendo pistas que alguien dejó para ella. Cada decisión la acerca a descubrir quién está detrás del misterio y a reencontrarse consigo misma.',
    coverColor: '#5B4A8B',
  },
  {
    id: 'b2',
    title: 'Un jardín para Tomás',
    synopsis:
      'Tomás hereda un jardín abandonado. Mientras decide qué sembrar, aprende a pedir ayuda y a cuidar su propio ritmo.',
    coverColor: '#3F6E55',
  },
  {
    id: 'b3',
    title: 'Respira, Clara',
    synopsis:
      'Clara practica pequeñas pausas durante un día agitado. Una historia breve para acompañar los momentos de espera.',
    coverColor: '#3A6EA5',
  },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'c1', bookId: 'b1', number: 1, title: 'El comienzo de la historia',
    paragraphs: [
      'Ana caminaba por las calles del cerro Alegre cuando comenzó a notar algo extraño en el lugar.',
      'En cada escalera había un pequeño dibujo de un faro, pintado con tiza azul, siempre apuntando hacia el mar.',
      'Se detuvo a respirar, miró el puerto y decidió seguir los dibujos para descubrir qué estaba ocurriendo.',
    ],
  },
  {
    id: 'c2', bookId: 'b1', number: 2, title: 'La carta en el ascensor', simulationId: 's1',
    paragraphs: [
      'Los dibujos terminaban en el ascensor Reina Victoria. Dentro, alguien había dejado un sobre con su nombre.',
      '"Si llegaste hasta aquí, estás lista para la siguiente pista", decía la carta, escrita con una letra que le pareció conocida.',
      'Ana sintió una mezcla de curiosidad y nervios. Tenía que decidir cómo seguir.',
    ],
  },
  {
    id: 'c3', bookId: 'b1', number: 3, title: 'La casa de los faros', simulationId: 's2',
    paragraphs: [
      'La pista la llevó a una casa antigua con la fachada llena de faros pintados.',
      'La puerta estaba entreabierta y desde adentro se escuchaba música suave.',
      'Ana recordó que no tenía que resolverlo todo de una vez: podía avanzar paso a paso.',
    ],
  },
  {
    id: 'c4', bookId: 'b1', number: 4, title: 'Pedro, el guardián',
    paragraphs: [
      'En la casa la esperaba Pedro, un pintor que conocía a su abuela desde hacía muchos años.',
      'Le contó que su abuela había preparado este recorrido para recordarle los lugares que más amaba.',
      'Ana escuchó en silencio y, por primera vez en semanas, se sintió acompañada.',
    ],
  },
  {
    id: 'c5', bookId: 'b1', number: 5, title: 'El último faro', simulationId: 's3',
    paragraphs: [
      'La última pista estaba en el mirador Paseo 21 de Mayo, frente al mar.',
      'Allí encontró una caja con fotografías y una nota: "Cada paso que diste hoy también es parte del camino".',
      'Ana decidió qué hacer con aquel regalo.',
    ],
  },
  {
    id: 'c6', bookId: 'b2', number: 1, title: 'La llave oxidada',
    paragraphs: [
      'Tomás abrió la reja del jardín con una llave oxidada que encontró en un cajón.',
      'Las malezas cubrían casi todo, pero entre ellas asomaba un rosal que seguía floreciendo.',
    ],
  },
  {
    id: 'c7', bookId: 'b2', number: 2, title: 'Pedir ayuda', simulationId: 's4',
    paragraphs: [
      'Después de una hora de trabajo, Tomás se sentó en la tierra, cansado.',
      'Su vecina lo saludó desde la reja y le ofreció una pala y un poco de compañía.',
    ],
  },
  {
    id: 'c8', bookId: 'b2', number: 3, title: 'Lo que crece despacio',
    paragraphs: [
      'Semanas después, las primeras semillas asomaron entre la tierra.',
      'Tomás entendió que algunas cosas crecen despacio y que eso también está bien.',
    ],
  },
  {
    id: 'c9', bookId: 'b3', number: 1, title: 'La sala de espera',
    paragraphs: [
      'Clara miraba el reloj de la sala de espera. Los minutos parecían más largos que nunca.',
      'Recordó un ejercicio simple: contar cuatro al inhalar y seis al exhalar.',
    ],
  },
  {
    id: 'c10', bookId: 'b3', number: 2, title: 'Una ventana',
    paragraphs: [
      'Desde la ventana se veía un árbol moviéndose con el viento.',
      'Clara se concentró en sus hojas y notó que sus hombros se relajaban.',
    ],
  },
  {
    id: 'c11', bookId: 'b3', number: 3, title: 'La elección de Clara', simulationId: 's5',
    paragraphs: [
      'Al final de la tarde, Clara pensó en cómo quería terminar su día.',
    ],
  },
];

export const CHARACTERS: Character[] = [
  { id: 'p1', name: 'Ana', description: 'Profesora curiosa que vuelve a Valparaíso.', attributes: 'Curiosa, reflexiva', chapterId: 'c2' },
  { id: 'p2', name: 'Pedro', description: 'Pintor y amigo de la abuela de Ana.', attributes: 'Paciente, cálido', chapterId: 'c4' },
  { id: 'p3', name: 'Tomás', description: 'Heredero de un jardín abandonado.', attributes: 'Perseverante, tímido', chapterId: 'c7' },
  { id: 'p4', name: 'Clara', description: 'Paciente que aprende a hacer pausas.', attributes: 'Serena, observadora', chapterId: 'c11' },
];

export const SIMULATIONS: Simulation[] = [
  {
    id: 's1', chapterId: 'c2', characterId: 'p1',
    context: 'Ana tiene la carta en sus manos. El ascensor está por subir y alguien la mira desde la plaza.',
    question: '¿Qué decides hacer?',
    options: [
      { id: 'o1', label: 'Subir en el ascensor', description: 'Seguir la pista de inmediato.', outcome: 'Ana sube y desde lo alto ve un faro pintado en una casa cercana.' },
      { id: 'o2', label: 'Hablar con la persona de la plaza', description: 'Preguntar si sabe algo de la carta.', outcome: 'La persona sonríe y le indica el camino hacia una casa llena de faros.' },
    ],
  },
  {
    id: 's2', chapterId: 'c3', characterId: 'p1',
    context: 'La puerta de la casa está entreabierta y se escucha música.',
    question: '¿Qué decides hacer?',
    options: [
      { id: 'o1', label: 'Entrar al lugar', description: 'Tocar la puerta y pasar.', outcome: 'Al entrar, Ana encuentra un taller de pintura lleno de luz.' },
      { id: 'o2', label: 'Continuar el camino', description: 'Observar un momento desde afuera.', outcome: 'Ana se sienta en la escalera; al rato, alguien sale a invitarla a pasar.' },
    ],
  },
  {
    id: 's3', chapterId: 'c5', characterId: 'p1',
    context: 'Ana tiene la caja de fotografías entre sus manos, frente al mar.',
    question: '¿Qué harás con el regalo?',
    options: [
      { id: 'o1', label: 'Compartirlo', description: 'Llamar a su familia y contarles.', outcome: 'La conversación termina en risas y planes para volver juntos a Valparaíso.' },
      { id: 'o2', label: 'Guardarlo para sí', description: 'Quedarse un rato mirando las fotos.', outcome: 'Ana se toma su tiempo. Siente que el recuerdo ahora también le pertenece.' },
    ],
  },
  {
    id: 's4', chapterId: 'c7', characterId: 'p3',
    context: 'La vecina ofrece su ayuda y Tomás está cansado.',
    question: '¿Qué responde Tomás?',
    options: [
      { id: 'o1', label: 'Aceptar la ayuda', description: 'Trabajar juntos una tarde.', outcome: 'Entre los dos limpian medio jardín y comparten un té.' },
      { id: 'o2', label: 'Descansar hoy', description: 'Agradecer y seguir mañana.', outcome: 'Tomás descansa. Al día siguiente vuelve con más energía.' },
    ],
  },
  {
    id: 's5', chapterId: 'c11', characterId: 'p4',
    context: 'El día terminó y Clara tiene un rato libre.',
    question: '¿Cómo termina Clara su día?',
    options: [
      { id: 'o1', label: 'Escuchar música', description: 'Su lista favorita, con audífonos.', outcome: 'Clara se duerme tranquila con su canción preferida.' },
      { id: 'o2', label: 'Escribir tres cosas buenas', description: 'Un pequeño diario de gratitud.', outcome: 'Clara descubre que el día tuvo más momentos buenos de los que creía.' },
    ],
  },
];

export const RESOURCES: Resource[] = [
  { id: 'r1', chapterId: 'c1', type: 'video', title: 'Paseo por los cerros', description: 'Recorrido visual por las escaleras del cerro Alegre.', durationSeconds: 84 },
  { id: 'r2', chapterId: 'c3', type: 'audio', title: 'Respiración guiada', description: 'Ejercicio de respiración de 3 minutos para antes de continuar.', durationSeconds: 180 },
  { id: 'r3', chapterId: 'c3', type: 'video', title: 'La casa de los faros', description: 'Ilustraciones animadas del capítulo.', durationSeconds: 95 },
  { id: 'r4', chapterId: 'c9', type: 'audio', title: 'Respirar 4-6', description: 'Audio para practicar la respiración que usa Clara.', durationSeconds: 120 },
];

/** Progreso inicial del paciente de prueba, para mostrar "Continúa donde lo dejaste". */
export const DEMO_PROGRESS: ProgressStore = {
  b1: {
    completedChapterIds: ['c1', 'c2'],
    lastChapterId: 'c3',
    decisions: { s1: 'o1' },
    updatedAt: '2026-09-20T10:00:00.000Z',
  },
};
