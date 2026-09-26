/** Crear (/admin/books/create) o editar (/admin/books/:id/edit) un libro (RF-01). */
import {
  IonButton, IonContent, IonInput, IonPage, IonSpinner, IonTextarea, useIonRouter, useIonToast,
} from '@ionic/react';
import { FormEvent, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { getBook, saveBook } from '../../services/bookService';
import { fieldClass } from '../../utils/validators';
import { usePageEnter } from '../../hooks/usePageEnter';

const AdminBookFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  usePageEnter(() => {
    setTouched(false);
    if (!id) {
      setTitle('');
      setSynopsis('');
      return;
    }
    getBook(id).then((book) => {
      setTitle(book?.title ?? '');
      setSynopsis(book?.synopsis ?? '');
    });
  });

  const errors = {
    title: title.trim().length >= 3 ? '' : 'El título debe tener al menos 3 caracteres.',
    synopsis: synopsis.trim().length >= 10 ? '' : 'La sinopsis debe tener al menos 10 caracteres.',
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (errors.title || errors.synopsis) return;
    setSaving(true);
    await saveBook({ id, title: title.trim(), synopsis: synopsis.trim() });
    setSaving(false);
    presentToast({ message: id ? 'Libro actualizado.' : 'Libro creado.', duration: 2000, color: 'success', position: 'top' });
    router.push('/admin/books', 'back');
  };

  return (
    <IonPage>
      <PageHeader title={id ? 'Editar libro' : 'Nuevo libro'} backHref="/admin/books" />
      <IonContent className="ion-padding">
        <form className="page-container narrow form-stack" onSubmit={handleSubmit} noValidate>
          <IonInput
            className={fieldClass(touched, errors.title)}
            label="Título *"
            labelPlacement="floating"
            fill="outline"
            maxlength={80}
            counter
            value={title}
            errorText={errors.title}
            onIonInput={(e) => setTitle(e.detail.value ?? '')}
          />
          <IonTextarea
            className={fieldClass(touched, errors.synopsis)}
            label="Sinopsis *"
            labelPlacement="floating"
            fill="outline"
            autoGrow
            rows={4}
            maxlength={400}
            counter
            value={synopsis}
            errorText={errors.synopsis}
            onIonInput={(e) => setSynopsis(e.detail.value ?? '')}
          />
          <p className="small-note">* Campo obligatorio. Los capítulos se agregan desde la gestión de capítulos (EP2).</p>
          <IonButton type="submit" expand="block" disabled={saving}>
            {saving ? <IonSpinner name="dots" aria-label="Guardando" /> : 'Guardar'}
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default AdminBookFormPage;
