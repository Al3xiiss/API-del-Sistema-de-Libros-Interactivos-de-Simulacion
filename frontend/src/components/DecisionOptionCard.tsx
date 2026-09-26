import { IonCard, IonCardContent, IonIcon } from '@ionic/react';
import { checkmarkCircle, ellipseOutline } from 'ionicons/icons';
import { DecisionOption } from '../types';

interface DecisionOptionCardProps {
  option: DecisionOption;
  letter: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}

/**
 * Opción de decisión como tarjeta amplia (punto crítico 1 del README):
 * tocarla solo la selecciona; la decisión se confirma con otro botón.
 */
const DecisionOptionCard: React.FC<DecisionOptionCardProps> = ({ option, letter, selected, disabled, onSelect }) => (
  <IonCard
    button={!disabled}
    disabled={disabled && !selected}
    onClick={disabled ? undefined : onSelect}
    className={`option-card${selected ? ' selected' : ''}`}
    aria-pressed={selected}
  >
    <IonCardContent className="option-card-content">
      <IonIcon aria-hidden="true" icon={selected ? checkmarkCircle : ellipseOutline} color={selected ? 'primary' : 'medium'} />
      <div>
        <strong>{letter}. {option.label}</strong>
        <p>{option.description}</p>
      </div>
    </IonCardContent>
  </IonCard>
);

export default DecisionOptionCard;
