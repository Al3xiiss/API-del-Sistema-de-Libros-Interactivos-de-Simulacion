/** Crear o editar un personaje y asociarlo a un capítulo (RF-07). */
import {
  IonButton, IonContent, IonInput, IonPage, IonSelect, IonSelectOption, IonSpinner, IonText, IonTextarea,
  useIonRouter, useIonToast,
} from '@ionic/react';
import { FormEvent, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { getAllChapters, getBooks } from '../../services/bookService';
import { getCharacter, saveCharacter } from '../../services/characterService';
import { Book, Chapter } from '../../types';
import { fieldClass } from '../../utils/validators';
import { usePageEnter } from '../../hooks/usePageEnter';

const EMPTY = { name: '', description: '', attributes: '', chapterId: '' };

const AdminCharacterFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const [form, setForm] = useState(EMPTY);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  usePageEnter(() => {
    setTouched(false);
    // Se limpia al entrar (no al terminar de cargar) para no borrar lo que el usuario ya escribió.
    setForm(EMPTY);
    Promise.all([getBooks(), getAllChapters()]).then(([bookList, chapterList]) => {
      setBooks(bookList);
      setChapters(chapterList.filter((c) => bookList.some((b) => b.id === c.bookId)));
    });
    if (id) {
      getCharacter(id).then((character) => character && setForm({ ...character }));
    }
  });

  const errors = {
    name: form.name.trim().length >= 2 ? '' : 'El nombre debe tener al menos 2 caracteres.',
    chapterId: form.chapterId ? '' : 'Selecciona el capítulo donde aparece.',
  };

  const setField = (field: keyof typeof EMPTY, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (errors.name || errors.chapterId) return;
    setSaving(true);
    await saveCharacter({ ...form, id });
    setSaving(false);
    presentToast({ message: id ? 'Personaje actualizado.' : 'Personaje creado.', duration: 2000, color: 'success', position: 'top' });
    router.push('/admin/characters', 'back');
  };

  const bookTitle = (bookId: string) => books.find((b) => b.id === bookId)?.title ?? '';

  return (
    <IonPage>
      <PageHeader title={id ? 'Editar personaje' : 'Nuevo personaje'} backHref="/admin/characters" />
      <IonContent className="ion-padding">
        <form className="page-container narrow form-stack" onSubmit={handleSubmit} noValidate>
          <IonInput
            className={fieldClass(touched, errors.name)}
            label="Nombre *"
            labelPlacement="floating"
            fill="outline"
            maxlength={40}
            value={form.name}
            errorText={errors.name}
            onIonInput={(e) => setField('name', e.detail.value ?? '')}
          />
          <IonTextarea
            label="Descripción"
            labelPlacement="floating"
            fill="outline"
            autoGrow
            rows={3}
            maxlength={200}
            counter
            value={form.description}
            onIonInput={(e) => setField('description', e.detail.value ?? '')}
          />
          <IonInput
            label="Atributos"
            labelPlacement="floating"
            fill="outline"
            helperText="Separados por coma. Ej: curiosa, reflexiva"
            value={form.attributes}
            onIonInput={(e) => setField('attributes', e.detail.value ?? '')}
          />
          <IonSelect
            label="Capítulo asociado *"
            labelPlacement="floating"
            fill="outline"
            interface="popover"
            value={form.chapterId}
            onIonChange={(e) => setField('chapterId', e.detail.value)}
          >
            {chapters.map((chapter) => (
              <IonSelectOption key={chapter.id} value={chapter.id}>
                {bookTitle(chapter.bookId)} · Cap. {chapter.number}
              </IonSelectOption>
            ))}
          </IonSelect>
          {touched && errors.chapterId && (
            <IonText color="danger"><p className="form-error">{errors.chapterId}</p></IonText>
          )}
          <p className="small-note">* Campo obligatorio</p>
          <IonButton type="submit" expand="block" disabled={saving}>
            {saving ? <IonSpinner name="dots" aria-label="Guardando" /> : 'Guardar'}
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default AdminCharacterFormPage;
