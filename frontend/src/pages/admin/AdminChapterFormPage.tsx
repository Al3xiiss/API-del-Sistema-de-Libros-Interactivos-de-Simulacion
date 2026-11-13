/* Crear (/admin/chapters/create?libro=1) o editar (/admin/chapters/:id/edit) un capítulo (EF). */
import {
  IonButton, IonContent, IonInput, IonPage, IonSelect, IonSelectOption, IonSpinner, IonText, IonTextarea,
  useIonRouter, useIonToast,
} from '@ionic/react';
import { FormEvent, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { saveChapter } from '../../services/adminContentService';
import { getBooks, getChapter } from '../../services/bookService';
import { Book } from '../../types';
import { fieldClass } from '../../utils/validators';
import { usePageEnter } from '../../hooks/usePageEnter';

const EMPTY = { bookId: '', number: '', title: '', content: '' };

const AdminChapterFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const [form, setForm] = useState(EMPTY);
  const [books, setBooks] = useState<Book[]>([]);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  usePageEnter(() => {
    setTouched(false);
    // Al crear, el libro viene en la URL (?libro=1) desde la lista de capítulos.
    const libro = new URLSearchParams(location.search).get('libro') ?? '';
    setForm({ ...EMPTY, bookId: libro });
    getBooks().then(setBooks);
    if (id) {
      getChapter(id).then((chapter) => {
        if (!chapter) return;
        setForm({
          bookId: chapter.bookId,
          number: String(chapter.number),
          title: chapter.title,
          // Los párrafos se vuelven a unir con una línea en blanco entre cada uno.
          content: chapter.paragraphs.join('\n\n'),
        });
      });
    }
  });

  const setField = (field: keyof typeof EMPTY, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const number = form.number.trim();
  const errors = {
    bookId: form.bookId ? '' : 'Selecciona el libro del capítulo.',
    number: number === '' || /^[1-9]\d*$/.test(number) ? '' : 'El número debe ser un entero mayor que 0.',
    title: form.title.trim().length >= 3 ? '' : 'El título debe tener al menos 3 caracteres.',
    content: form.content.trim().length >= 10 ? '' : 'El contenido debe tener al menos 10 caracteres.',
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (Object.values(errors).some(Boolean)) return;
    setSaving(true);
    try {
      await saveChapter({
        id,
        bookId: form.bookId,
        number: number ? Number(number) : undefined,
        title: form.title.trim(),
        content: form.content.trim(),
      });
      presentToast({ message: id ? 'Capítulo actualizado.' : 'Capítulo creado.', duration: 2000, color: 'success', position: 'top' });
      router.push('/admin/chapters', 'back');
    } catch (err) {
      // Mensaje de la API, ej. "Ese libro ya tiene un capítulo con ese número"
      presentToast({ message: (err as Error).message, duration: 3000, color: 'danger', position: 'top' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonPage>
      <PageHeader title={id ? 'Editar capítulo' : 'Nuevo capítulo'} backHref="/admin/chapters" />
      <IonContent className="ion-padding">
        <form className="page-container narrow form-stack" onSubmit={handleSubmit} noValidate>
          <IonSelect
            label="Libro *"
            labelPlacement="floating"
            fill="outline"
            interface="popover"
            value={form.bookId}
            onIonChange={(e) => setField('bookId', e.detail.value)}
          >
            {books.map((book) => (
              <IonSelectOption key={book.id} value={book.id}>{book.title}</IonSelectOption>
            ))}
          </IonSelect>
          {touched && errors.bookId && (
            <IonText color="danger"><p className="form-error">{errors.bookId}</p></IonText>
          )}
          <IonInput
            className={fieldClass(touched, errors.number)}
            label="Número"
            labelPlacement="floating"
            fill="outline"
            inputmode="numeric"
            helperText="Si lo dejas vacío, se usa el siguiente número del libro."
            value={form.number}
            errorText={errors.number}
            onIonInput={(e) => setField('number', e.detail.value ?? '')}
          />
          <IonInput
            className={fieldClass(touched, errors.title)}
            label="Título *"
            labelPlacement="floating"
            fill="outline"
            maxlength={120}
            counter
            value={form.title}
            errorText={errors.title}
            onIonInput={(e) => setField('title', e.detail.value ?? '')}
          />
          <IonTextarea
            className={fieldClass(touched, errors.content)}
            label="Contenido *"
            labelPlacement="floating"
            fill="outline"
            autoGrow
            rows={8}
            maxlength={20000}
            helperText="Separa los párrafos con una línea en blanco."
            value={form.content}
            errorText={errors.content}
            onIonInput={(e) => setField('content', e.detail.value ?? '')}
          />
          <p className="small-note">* Campo obligatorio</p>
          <IonButton type="submit" expand="block" disabled={saving}>
            {saving ? <IonSpinner name="dots" aria-label="Guardando" /> : 'Guardar'}
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default AdminChapterFormPage;