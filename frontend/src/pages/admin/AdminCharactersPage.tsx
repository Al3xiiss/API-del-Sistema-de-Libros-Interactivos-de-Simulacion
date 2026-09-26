/** Gestión de personajes (RF-07). Figma: "Gestión de personajes - Móvil". */
import {
  IonButton, IonCol, IonContent, IonFooter, IonGrid, IonIcon, IonPage, IonRow, IonSkeletonText, IonToolbar,
  useIonAlert, useIonToast,
} from '@ionic/react';
import { addOutline, peopleOutline } from 'ionicons/icons';
import { useState } from 'react';
import AdminItemCard from '../../components/AdminItemCard';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import { getAllChapters } from '../../services/bookService';
import { deleteCharacter, getCharacters } from '../../services/characterService';
import { Chapter, Character } from '../../types';
import { usePageEnter } from '../../hooks/usePageEnter';

const AdminCharactersPage: React.FC = () => {
  const [characters, setCharacters] = useState<Character[] | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  const load = () =>
    Promise.all([getCharacters(), getAllChapters()]).then(([list, allChapters]) => {
      setChapters(allChapters);
      setCharacters(list);
    });
  usePageEnter(() => { load(); });

  const chapterLabel = (chapterId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    return chapter ? `Capítulo asociado: ${chapter.number} · ${chapter.title}` : 'Sin capítulo asociado';
  };

  const confirmDelete = (character: Character) =>
    presentAlert({
      header: 'Eliminar personaje',
      message: `¿Seguro que quieres eliminar a "${character.name}"? Las simulaciones que lo usan mostrarán un personaje genérico.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await deleteCharacter(character.id);
            presentToast({ message: 'Personaje eliminado.', duration: 2000, position: 'top' });
            load();
          },
        },
      ],
    });

  return (
    <IonPage>
      <PageHeader title="Gestión de personajes" />
      <IonContent className="ion-padding">
        <div className="page-container">
          {characters === null && <IonSkeletonText animated className="skeleton-card" />}
          {characters?.length === 0 && (
            <EmptyState icon={peopleOutline} title="No hay personajes" message="Crea un personaje para usarlo en las simulaciones." />
          )}
          <IonGrid className="ion-no-padding">
            <IonRow>
              {characters?.map((character) => (
                <IonCol size="12" sizeMd="6" key={character.id}>
                  <AdminItemCard
                    title={character.name}
                    subtitle={chapterLabel(character.chapterId)}
                    detail={`Atributos: ${character.attributes || '—'}`}
                    editHref={`/admin/characters/${character.id}/edit`}
                    onDelete={() => confirmDelete(character)}
                  />
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
      <IonFooter>
        <IonToolbar className="footer-actions">
          <IonButton expand="block" routerLink="/admin/characters/create">
            <IonIcon aria-hidden="true" slot="start" icon={addOutline} />
            Nuevo personaje
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default AdminCharactersPage;
