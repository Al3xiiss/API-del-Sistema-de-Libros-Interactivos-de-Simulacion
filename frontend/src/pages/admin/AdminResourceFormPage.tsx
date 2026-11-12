/** Crear (/admin/resources/create) o editar (/admin/resources/:id/edit) un recurso multimedia (EF). */
import {
  IonButton, IonContent, IonInput, IonLabel, IonPage, IonSegment, IonSegmentButton, IonSelect, IonSelectOption,
  IonSpinner, IonText, IonTextarea, useIonRouter, useIonToast,
} from '@ionic/react';
import { FormEvent, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { getResource, saveResource } from '../../services/adminContentService';
import { getAllChapters, getBooks } from '../../services/bookService';
import { Book, Chapter, Resource } from '../../types';
import { fieldClass } from '../../utils/validators';
import { usePageEnter } from '../../hooks/usePageEnter';

// Las mismas reglas que valida la API: un archivo de /media/ o una dirección http(s), por ejemplo de YouTube.
const ARCHIVO_LOCAL = /^\/media\/[a-z0-9_-]+\.(mp3|m4a|ogg|wav|mp4|webm)$/i;
const URL_EXTERNA = /^https?:\/\/[^\s"'<>]+$/i;

const EMPTY = { chapterId: '', type: 'video' as Resource['type'], title: '', description: '', url: '', duration: '' };

/** 256 → "4:16" */
const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

const AdminResourceFormPage: React.FC = () => {
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
    setForm(EMPTY);
    Promise.all([getBooks(), getAllChapters()]).then(([bookList, chapterList]) => {
      setBooks(bookList);
      setChapters(chapterList);
    });
    if (id) {
      getResource(id).then((resource) => {
        if (!resource) return;
        setForm({
          chapterId: resource.chapterId,
          type: resource.type,
          title: resource.title,
          description: resource.description,
          url: resource.url ?? '',
          duration: resource.durationSeconds ? String(resource.durationSeconds) : '',
        });
      });
    }
  });

  const setField = (field: keyof typeof EMPTY, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const url = form.url.trim();
  const duration = form.duration.trim();
  const errors = {
    chapterId: form.chapterId ? '' : 'Selecciona el capítulo del recurso.',
    title: form.title.trim().length >= 3 ? '' : 'El título debe tener al menos 3 caracteres.',
    url: url === '' || ARCHIVO_LOCAL.test(url) || URL_EXTERNA.test(url)
      ? ''
      : 'Usa un enlace http:// o https:// (por ejemplo de YouTube) o un archivo de /media/.',
    duration: duration === '' || (/^\d+$/.test(duration) && Number(duration) >= 1 && Number(duration) <= 86400)
      ? ''
      : 'La duración debe ser un número entero de segundos entre 1 y 86400.',
  };

  const durationHelp = duration && !errors.duration
    ? `Equivale a ${formatDuration(Number(duration))} (minutos:segundos).`
    : 'En segundos. Ej: 180 = 3 minutos.';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (Object.values(errors).some(Boolean)) return;
    setSaving(true);
    try {
      await saveResource({
        id,
        chapterId: form.chapterId,
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim(),
        url: url || undefined,
        durationSeconds: duration ? Number(duration) : 0,
      });
      presentToast({ message: id ? 'Recurso actualizado.' : 'Recurso creado.', duration: 2000, color: 'success', position: 'top' });
      router.push('/admin/resources', 'back');
    } catch (err) {
      presentToast({ message: (err as Error).message, duration: 3000, color: 'danger', position: 'top' });
    } finally {
      setSaving(false);
    }
  };

  const bookTitle = (bookId: string) => books.find((b) => b.id === bookId)?.title ?? '';

  return (
    <IonPage>
      <PageHeader title={id ? 'Editar recurso' : 'Nuevo recurso'} backHref="/admin/resources" />
      <IonContent className="ion-padding">
        <form className="page-container narrow form-stack" onSubmit={handleSubmit} noValidate>
          <IonSegment
            value={form.type}
            onIonChange={(e) => setField('type', String(e.detail.value))}
            aria-label="Tipo de recurso"
          >
            <IonSegmentButton value="video"><IonLabel>Video</IonLabel></IonSegmentButton>
            <IonSegmentButton value="audio"><IonLabel>Audio</IonLabel></IonSegmentButton>
          </IonSegment>
          <IonSelect
            label="Capítulo *"
            labelPlacement="floating"
            fill="outline"
            interface="popover"
            value={form.chapterId}
            onIonChange={(e) => setField('chapterId', e.detail.value)}
          >
            {chapters.map((chapter) => (
              <IonSelectOption key={chapter.id} value={chapter.id}>
                {bookTitle(chapter.bookId)} · Cap. {chapter.number}: {chapter.title}
              </IonSelectOption>
            ))}
          </IonSelect>
          {touched && errors.chapterId && (
            <IonText color="danger"><p className="form-error">{errors.chapterId}</p></IonText>
          )}
          <IonInput
            className={fieldClass(touched, errors.title)}
            label="Título *"
            labelPlacement="floating"
            fill="outline"
            maxlength={100}
            counter
            value={form.title}
            errorText={errors.title}
            onIonInput={(e) => setField('title', e.detail.value ?? '')}
          />
          <IonTextarea
            label="Descripción"
            labelPlacement="floating"
            fill="outline"
            autoGrow
            rows={3}
            maxlength={300}
            counter
            value={form.description}
            onIonInput={(e) => setField('description', e.detail.value ?? '')}
          />
          <IonInput
            className={fieldClass(touched, errors.url)}
            label="Enlace"
            labelPlacement="floating"
            fill="outline"
            type="url"
            maxlength={500}
            helperText="Ej: https://youtu.be/... Si lo dejas vacío, se muestra un reproductor de vista previa."
            value={form.url}
            errorText={errors.url}
            onIonInput={(e) => setField('url', e.detail.value ?? '')}
          />
          <IonInput
            className={fieldClass(touched, errors.duration)}
            label="Duración (segundos)"
            labelPlacement="floating"
            fill="outline"
            inputmode="numeric"
            helperText={durationHelp}
            value={form.duration}
            errorText={errors.duration}
            onIonInput={(e) => setField('duration', e.detail.value ?? '')}
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

export default AdminResourceFormPage;