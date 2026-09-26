/** Panel de administración (/admin). Resumen y accesos a la gestión de contenido. */
import {
  IonButton, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonIcon, IonPage, IonRow,
} from '@ionic/react';
import { addOutline, bookOutline, peopleOutline } from 'ionicons/icons';
import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { countPatients } from '../../services/authService';
import { getAllChapters, getBooks } from '../../services/bookService';
import { getCharacters } from '../../services/characterService';
import { usePageEnter } from '../../hooks/usePageEnter';

const AdminHomePage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ books: 0, chapters: 0, characters: 0, patients: 0 });

  usePageEnter(() => {
    Promise.all([getBooks(), getAllChapters(), getCharacters()]).then(([books, chapters, characters]) => {
      const bookIds = books.map((b) => b.id);
      setStats({
        books: books.length,
        chapters: chapters.filter((c) => bookIds.includes(c.bookId)).length,
        characters: characters.length,
        patients: countPatients(),
      });
    });
  });

  const cards = [
    { label: 'Libros', value: stats.books },
    { label: 'Capítulos', value: stats.chapters },
    { label: 'Personajes', value: stats.characters },
    { label: 'Pacientes registrados', value: stats.patients },
  ];

  return (
    <IonPage>
      <PageHeader title="Panel de administración" />
      <IonContent className="ion-padding">
        <div className="page-container">
          <h1 className="page-title">Hola, {user?.alias}</h1>
          <IonGrid className="ion-no-padding">
            <IonRow>
              {cards.map((card) => (
                <IonCol size="6" sizeLg="3" key={card.label}>
                  <IonCard className="stat-card">
                    <IonCardContent>
                      <span className="stat-value">{card.value}</span>
                      <span className="stat-label">{card.label}</span>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>

          <h2 className="section-title">Gestión de contenido</h2>
          <div className="stacked-actions">
            <IonButton expand="block" routerLink="/admin/books">
              <IonIcon aria-hidden="true" slot="start" icon={bookOutline} />
              Gestión de libros
            </IonButton>
            <IonButton expand="block" routerLink="/admin/characters">
              <IonIcon aria-hidden="true" slot="start" icon={peopleOutline} />
              Gestión de personajes
            </IonButton>
            <IonButton expand="block" fill="outline" routerLink="/admin/books/create">
              <IonIcon aria-hidden="true" slot="start" icon={addOutline} />
              Nuevo libro
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminHomePage;
