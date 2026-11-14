/** Crear (/admin/resources/create) o editar (/admin/resources/:id/edit) un recurso multimedia (EF). */
import {
  IonButton, IonContent, IonIcon, IonInput, IonLabel, IonPage, IonSegment, IonSegmentButton, IonSelect,
  IonSelectOption, IonSpinner, IonText, IonTextarea, useIonRouter, useIonToast,
} from '@ionic/react';
import { logoYoutube } from 'ionicons/icons';
import { FormEvent, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { getResource, getYoutubeVideo, saveResource, YoutubeVideo } from '../../services/adminContentService';
import { getAllChapters, getBooks } from '../../services/bookService';
import { Book, Chapter, Resource } from '../../types';
import { fieldClass } from '../../utils/validators';
import { usePageEnter } from '../../hooks/usePageEnter';

// Las mismas reglas que valida la API: un video de YouTube o un archivo de audio o video
// (en /media/ o en otro sitio con https://, EF3).
const ARCHIVO_LOCAL = /^\/media\/[a-z0-9_-]+\.(mp3|m4a|ogg|wav|mp4|webm)$/i;
const ARCHIVO_EXTERNO = /^https:\/\/[^\s"'<>?#]+\.(mp3|m4a|ogg|wav|mp4|webm)(\?[^\s"'<>#]*)?$/i;
const YOUTUBE = /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)[\w-]{11}(?:[?&#].*)?$/i;

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
  // Datos del video que entregó YouTube (servicio externo, EF5)
  const [youtube, setYoutube] = useState<YoutubeVideo | null>(null);
  const [checkingYoutube, setCheckingYoutube] = useState(false);

  usePageEnter(() => {
    setTouched(false);
    setForm(EMPTY);
    setYoutube(null);
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

  const changeUrl = (value: string) => {
    setField('url', value);
    setYoutube(null); // si cambia el enlace, hay que volver a consultar el video
  };

  const url = form.url.trim();
  const duration = form.duration.trim();
  const errors = {
    chapterId: form.chapterId ? '' : 'Selecciona el capítulo del recurso.',
    title: form.title.trim().length >= 3 ? '' : 'El título debe tener al menos 3 caracteres.',
    url: url === '' || ARCHIVO_LOCAL.test(url) || ARCHIVO_EXTERNO.test(url) || YOUTUBE.test(url)
      ? ''
      : 'Usa un video de YouTube o un archivo de audio o video (.mp3, .m4a, .ogg, .wav, .mp4 o .webm) de /media/ o con https://.',
    duration: duration === '' || (/^\d+$/.test(duration) && Number(duration) >= 1 && Number(duration) <= 86400)
      ? ''
      : 'La duración debe ser un número entero de segundos entre 1 y 86400.',
  };

  const isYoutube = YOUTUBE.test(url);
  const durationHelp = isYoutube
    ? 'En los videos de YouTube se guarda la duración real del video.'
    : duration && !errors.duration
      ? `Equivale a ${formatDuration(Number(duration))} (minutos:segundos).`
      : 'En segundos. Ej: 180 = 3 minutos.';

  // La API consulta el video en YouTube: si existe y se puede insertar, completa el título (si está vacío) y la duración.
  const completeWithYoutube = async () => {
    setCheckingYoutube(true);
    try {
      const video = await getYoutubeVideo(url);
      setYoutube(video);
      setForm((f) => ({
        ...f,
        title: f.title.trim() ? f.title : video.title.slice(0, 100),
        duration: video.durationSeconds ? String(video.durationSeconds) : f.duration,
      }));
    } catch (err) {
      // Mensaje de la API, ej. "El video de YouTube no existe o es privado"
      presentToast({ message: (err as Error).message, duration: 3000, color: 'danger', position: 'top' });
    } finally {
      setCheckingYoutube(false);
    }
  };

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
            helperText="Un video de YouTube o un archivo .mp3, .mp4, etc. Si lo dejas vacío, se muestra un reproductor de vista previa."
            value={form.url}
            errorText={errors.url}
            onIonInput={(e) => changeUrl(e.detail.value ?? '')}
          />
          {isYoutube && !youtube && (
            <IonButton fill="outline" onClick={completeWithYoutube} disabled={checkingYoutube}>
              <IonIcon aria-hidden="true" slot="start" icon={logoYoutube} />
              {checkingYoutube ? 'Consultando YouTube...' : 'Completar con YouTube'}
            </IonButton>
          )}
          {youtube && (
            <div className="youtube-preview">
              {youtube.thumbnail && <img src={youtube.thumbnail} alt="" />}
              <div>
                <strong>{youtube.title}</strong>
                <p className="small-note">
                  {youtube.channel}
                  {youtube.durationSeconds ? ` · ${formatDuration(youtube.durationSeconds)}` : ''}
                </p>
                <IonText color="success"><p className="small-note">Video verificado en YouTube</p></IonText>
              </div>
            </div>
          )}
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