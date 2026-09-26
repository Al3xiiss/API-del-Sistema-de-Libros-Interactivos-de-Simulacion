import { IonIcon, IonItem, IonLabel, IonNote } from '@ionic/react';
import { checkmarkCircle, lockClosed, playCircle } from 'ionicons/icons';
import { Chapter, ChapterStatus } from '../types';

const STATUS = {
  completed: { icon: checkmarkCircle, color: 'success', text: 'Completado' },
  available: { icon: playCircle, color: 'primary', text: 'Disponible' },
  locked: { icon: lockClosed, color: 'medium', text: 'Bloqueado' },
};

interface ChapterListItemProps {
  chapter: Chapter;
  status: ChapterStatus;
  onSelect: (chapter: Chapter, status: ChapterStatus) => void;
}

/** Fila de la lista de capítulos con su estado (RF-02). */
const ChapterListItem: React.FC<ChapterListItemProps> = ({ chapter, status, onSelect }) => {
  const { icon, color, text } = STATUS[status];
  return (
    <IonItem button detail={status !== 'locked'} onClick={() => onSelect(chapter, status)}>
      <IonIcon aria-hidden="true" slot="start" icon={icon} color={color} />
      <IonLabel>
        <h3>Capítulo {chapter.number}: {chapter.title}</h3>
        <IonNote color={color === 'medium' ? 'medium' : undefined}>{text}</IonNote>
      </IonLabel>
    </IonItem>
  );
};

export default ChapterListItem;
