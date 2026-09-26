import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonProgressBar } from '@ionic/react';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  chapterCount: number;
  /** Avance de 0 a 1. */
  percent: number;
}

/** Tarjeta de libro de la biblioteca; lleva al detalle con sus capítulos. */
const BookCard: React.FC<BookCardProps> = ({ book, chapterCount, percent }) => (
  <IonCard button routerLink={`/app/books/${book.id}`} className="book-card">
    <div className="book-cover" style={{ background: book.coverColor }} aria-hidden="true">
      <span>{book.title.charAt(0)}</span>
    </div>
    <IonCardHeader>
      <IonCardTitle>{book.title}</IonCardTitle>
      <IonCardSubtitle>{chapterCount} capítulos</IonCardSubtitle>
    </IonCardHeader>
    <IonCardContent>
      <IonProgressBar value={percent} aria-label={`Avance ${Math.round(percent * 100)}%`} />
      <p className="small-note">{Math.round(percent * 100)}% leído</p>
    </IonCardContent>
  </IonCard>
);

export default BookCard;
