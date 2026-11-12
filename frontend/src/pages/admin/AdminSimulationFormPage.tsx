/* Crear (/admin/simulations/create) o editar (/admin/simulations/:id/edit) una simulación con sus opciones (EF). */
import {
  IonButton, IonCard, IonCardContent, IonContent, IonIcon, IonInput, IonPage, IonSelect, IonSelectOption,
  IonSpinner, IonText, IonTextarea, useIonRouter, useIonToast,
} from '@ionic/react';
import { addOutline, trashOutline } from 'ionicons/icons';
import { FormEvent, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { OptionInput, saveSimulation } from '../../services/adminContentService';
import { getAllChapters, getBooks, getSimulation } from '../../services/bookService';
import { getCharacters } from '../../services/characterService';
import { Book, Chapter, Character } from '../../types';
import { fieldClass } from '../../utils/validators';
import { usePageEnter } from '../../hooks/usePageEnter';

const MIN_OPCIONES = 2;
const MAX_OPCIONES = 4;

/** `key` identifica cada tarjeta en React, también las opciones nuevas que aún no tienen id. */
type OptionForm = OptionInput & { key: string };

let siguienteClave = 0;
const newOption = (): OptionForm => ({ key: `nueva-${(siguienteClave += 1)}`, label: '', description: '', outcome: '' });

const emptyForm = () => ({
  chapterId: '',
  characterId: '',
  context: '',
  question: '',
  options: [newOption(), newOption()],
});

const AdminSimulationFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const [form, setForm] = useState(emptyForm);
  // Datos que tenía la simulación al abrir el formulario (para editar).
  const [original, setOriginal] = useState({ bookId: '', characterId: '', optionIds: [] as string[] });
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  usePageEnter(() => {
    setTouched(false);
    setForm(emptyForm());
    setOriginal({ bookId: '', characterId: '', optionIds: [] });
    Promise.all([getBooks(), getAllChapters(), getCharacters()]).then(([bookList, chapterList, characterList]) => {
      setBooks(bookList);
      setChapters(chapterList);
      setCharacters(characterList);
      if (!id) return;
      getSimulation(id).then((simulation) => {
        if (!simulation) return;
        setForm({
          chapterId: simulation.chapterId,
          characterId: simulation.characterId,
          context: simulation.context,
          question: simulation.question,
          options: simulation.options.map((o) => ({ ...o, key: o.id })),
        });
        setOriginal({
          bookId: chapterList.find((c) => c.id === simulation.chapterId)?.bookId ?? '',
          characterId: simulation.characterId,
          optionIds: simulation.options.map((o) => o.id),
        });
      });
    });
  });

  const bookOf = (chapterId: string) => chapters.find((c) => c.id === chapterId)?.bookId ?? '';
  const bookTitle = (bookId: string) => books.find((b) => b.id === bookId)?.title ?? '';

  // Un capítulo tiene como máximo una simulación. Al editar, solo se puede mover a otro capítulo del mismo libro.
  const availableChapters = chapters.filter(
    (c) => (!c.simulationId || c.simulationId === id) && (!id || c.bookId === original.bookId),
  );
  // Solo se ofrecen los personajes del mismo libro que el capítulo elegido.
  const availableCharacters = characters.filter(
    (ch) => form.chapterId && bookOf(ch.chapterId) === bookOf(form.chapterId),
  );
  // La API no permite quitar el personaje de una simulación que ya tiene uno.
  const allowGeneric = !id || !original.characterId;

  const setField = (field: 'context' | 'question' | 'characterId', value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  // Si el personaje elegido es de otro libro, se vuelve al personaje genérico.
  const changeChapter = (chapterId: string) =>
    setForm((f) => {
      const character = characters.find((ch) => ch.id === f.characterId);
      const sameBook = character !== undefined && bookOf(character.chapterId) === bookOf(chapterId);
      return { ...f, chapterId, characterId: sameBook ? f.characterId : '' };
    });

  const setOption = (index: number, field: keyof OptionInput, value: string) =>
    setForm((f) => ({
      ...f,
      options: f.options.map((option, i) => (i === index ? { ...option, [field]: value } : option)),
    }));

  const addOption = () => setForm((f) => ({ ...f, options: [...f.options, newOption()] }));
  const removeOption = (index: number) =>
    setForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== index) }));

  const errors = {
    chapterId: form.chapterId ? '' : 'Selecciona el capítulo donde ocurre la simulación.',
    context: form.context.trim().length >= 10 ? '' : 'El contexto debe tener al menos 10 caracteres.',
    question: form.question.trim().length >= 5 ? '' : 'La pregunta debe tener al menos 5 caracteres.',
  };
  const optionErrors = form.options.map((option) => ({
    label: option.label.trim().length >= 2 ? '' : 'El texto debe tener al menos 2 caracteres.',
    outcome: option.outcome.trim().length >= 5 ? '' : 'La consecuencia debe tener al menos 5 caracteres.',
  }));
  const hasErrors = Object.values(errors).some(Boolean) || optionErrors.some((e) => e.label || e.outcome);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (hasErrors) return;
    setSaving(true);
    try {
      await saveSimulation(
        {
          id,
          chapterId: form.chapterId,
          characterId: form.characterId,
          context: form.context.trim(),
          question: form.question.trim(),
          options: form.options.map((o) => ({
            id: o.id, label: o.label.trim(), description: o.description.trim(), outcome: o.outcome.trim(),
          })),
        },
        original.optionIds,
      );
      presentToast({ message: id ? 'Simulación actualizada.' : 'Simulación creada.', duration: 2000, color: 'success', position: 'top' });
      router.push('/admin/simulations', 'back');
    } catch (err) {
      // Mensaje de la API, ej. "Ese capítulo ya tiene una simulación"
      presentToast({ message: (err as Error).message, duration: 3000, color: 'danger', position: 'top' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonPage>
      <PageHeader title={id ? 'Editar simulación' : 'Nueva simulación'} backHref="/admin/simulations" />
      <IonContent className="ion-padding">
        <form className="page-container narrow form-stack" onSubmit={handleSubmit} noValidate>
          <IonSelect
            label="Capítulo *"
            labelPlacement="floating"
            fill="outline"
            interface="popover"
            value={form.chapterId}
            onIonChange={(e) => changeChapter(e.detail.value)}
          >
            {availableChapters.map((chapter) => (
              <IonSelectOption key={chapter.id} value={chapter.id}>
                {bookTitle(chapter.bookId)} · Cap. {chapter.number}: {chapter.title}
              </IonSelectOption>
            ))}
          </IonSelect>
          {touched && errors.chapterId && (
            <IonText color="danger"><p className="form-error">{errors.chapterId}</p></IonText>
          )}
          {!id && (
            <p className="small-note">Solo aparecen los capítulos que todavía no tienen simulación.</p>
          )}
          <IonSelect
            label="Personaje"
            labelPlacement="floating"
            fill="outline"
            interface="popover"
            value={form.characterId}
            disabled={!form.chapterId}
            onIonChange={(e) => setField('characterId', e.detail.value)}
          >
            {allowGeneric && <IonSelectOption value="">Personaje genérico</IonSelectOption>}
            {availableCharacters.map((character) => (
              <IonSelectOption key={character.id} value={character.id}>{character.name}</IonSelectOption>
            ))}
          </IonSelect>
          <IonTextarea
            className={fieldClass(touched, errors.context)}
            label="Contexto *"
            labelPlacement="floating"
            fill="outline"
            autoGrow
            rows={4}
            maxlength={2000}
            helperText="La situación que vive el personaje antes de decidir."
            value={form.context}
            errorText={errors.context}
            onIonInput={(e) => setField('context', e.detail.value ?? '')}
          />
          <IonInput
            className={fieldClass(touched, errors.question)}
            label="Pregunta *"
            labelPlacement="floating"
            fill="outline"
            maxlength={200}
            counter
            value={form.question}
            errorText={errors.question}
            onIonInput={(e) => setField('question', e.detail.value ?? '')}
          />

          <h2 className="section-title">Opciones de decisión</h2>
          <p className="small-note">
            Entre {MIN_OPCIONES} y {MAX_OPCIONES} opciones. La consecuencia se muestra al paciente después de confirmar su decisión.
          </p>
          {form.options.map((option, index) => (
            <IonCard className="option-card" key={option.key}>
              <IonCardContent className="form-stack">
                <div className="option-card-header">
                  <strong>Opción {index + 1}</strong>
                  <IonButton
                    fill="clear"
                    color="danger"
                    disabled={form.options.length <= MIN_OPCIONES}
                    onClick={() => removeOption(index)}
                  >
                    <IonIcon aria-hidden="true" slot="start" icon={trashOutline} />
                    Quitar
                  </IonButton>
                </div>
                <IonInput
                  className={fieldClass(touched, optionErrors[index].label)}
                  label="Texto de la opción *"
                  labelPlacement="floating"
                  fill="outline"
                  maxlength={100}
                  value={option.label}
                  errorText={optionErrors[index].label}
                  onIonInput={(e) => setOption(index, 'label', e.detail.value ?? '')}
                />
                <IonTextarea
                  label="Descripción"
                  labelPlacement="floating"
                  fill="outline"
                  autoGrow
                  rows={2}
                  maxlength={200}
                  value={option.description}
                  onIonInput={(e) => setOption(index, 'description', e.detail.value ?? '')}
                />
                <IonTextarea
                  className={fieldClass(touched, optionErrors[index].outcome)}
                  label="Consecuencia *"
                  labelPlacement="floating"
                  fill="outline"
                  autoGrow
                  rows={3}
                  maxlength={2000}
                  value={option.outcome}
                  errorText={optionErrors[index].outcome}
                  onIonInput={(e) => setOption(index, 'outcome', e.detail.value ?? '')}
                />
              </IonCardContent>
            </IonCard>
          ))}
          <IonButton fill="outline" onClick={addOption} disabled={form.options.length >= MAX_OPCIONES}>
            <IonIcon aria-hidden="true" slot="start" icon={addOutline} />
            Agregar opción
          </IonButton>

          <p className="small-note">* Campo obligatorio</p>
          <IonButton type="submit" expand="block" disabled={saving}>
            {saving ? <IonSpinner name="dots" aria-label="Guardando" /> : 'Guardar'}
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default AdminSimulationFormPage;