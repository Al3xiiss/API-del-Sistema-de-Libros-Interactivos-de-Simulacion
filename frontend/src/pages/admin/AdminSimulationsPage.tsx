/* Gestión de simulaciones (EF): cada simulación pertenece a un capítulo y tiene de 2 a 4 opciones de decisión. */
import {
  IonButton, IonCol, IonContent, IonFooter, IonGrid, IonIcon, IonPage, IonRow, IonSkeletonText, IonToolbar,
  useIonAlert, useIonToast,
} from '@ionic/react';
import { addOutline, gitBranchOutline } from 'ionicons/icons';
import { useState } from 'react';
import AdminItemCard from '../../components/AdminItemCard';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import { deleteSimulation, getAllSimulations, SimulationSummary } from '../../services/adminContentService';
import { getBooks } from '../../services/bookService';
import { Book } from '../../types';
import { usePageEnter } from '../../hooks/usePageEnter';

const AdminSimulationsPage: React.FC = () => {
  const [simulations, setSimulations] = useState<SimulationSummary[] | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  const load = () =>
    Promise.all([getAllSimulations(), getBooks()]).then(([list, bookList]) => {
      setBooks(bookList);
      setSimulations(list);
    });
  usePageEnter(() => { load(); });

  const bookTitle = (bookId: string) => books.find((b) => b.id === bookId)?.title ?? 'Libro';

  const confirmDelete = (simulation: SimulationSummary) =>
    presentAlert({
      header: 'Eliminar simulación',
      message: `¿Seguro que quieres eliminar la simulación del capítulo ${simulation.chapterNumber}? También se eliminarán sus opciones y las decisiones que tomaron los pacientes. Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await deleteSimulation(simulation.id);
              presentToast({ message: 'Simulación eliminada.', duration: 2000, position: 'top' });
              load();
            } catch (err) {
              presentToast({ message: (err as Error).message, duration: 3000, color: 'danger', position: 'top' });
            }
          },
        },
      ],
    });

  return (
    <IonPage>
      <PageHeader title="Gestión de simulaciones" />
      <IonContent className="ion-padding">
        <div className="page-container">
          {simulations === null && <IonSkeletonText animated className="skeleton-card" />}
          {simulations?.length === 0 && (
            <EmptyState
              icon={gitBranchOutline}
              title="No hay simulaciones"
              message="Crea una simulación para que el paciente tome una decisión al final de un capítulo."
            />
          )}
          <IonGrid className="ion-no-padding">
            <IonRow>
              {simulations?.map((simulation) => (
                <IonCol size="12" sizeMd="6" key={simulation.id}>
                  <AdminItemCard
                    title={simulation.question}
                    subtitle={`${bookTitle(simulation.bookId)} · Capítulo ${simulation.chapterNumber}: ${simulation.chapterTitle}`}
                    detail={`${simulation.optionCount} opciones · Personaje: ${simulation.characterName || 'genérico'}`}
                    editHref={`/admin/simulations/${simulation.id}/edit`}
                    onDelete={() => confirmDelete(simulation)}
                  />
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
      <IonFooter>
        <IonToolbar className="footer-actions">
          <IonButton expand="block" routerLink="/admin/simulations/create">
            <IonIcon aria-hidden="true" slot="start" icon={addOutline} />
            Nueva simulación
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default AdminSimulationsPage;