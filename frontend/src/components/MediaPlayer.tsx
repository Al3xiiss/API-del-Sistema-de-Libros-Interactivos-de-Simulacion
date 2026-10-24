/**
 * Reproductor multimedia (RF-05).
 * Si el recurso tiene archivo (url que entrega la API) usa el <video>/<audio> del navegador.
 * Si no, muestra una vista previa que imita los controles del Figma (play/pausa, barra y tiempo).
 */
import { IonButton, IonIcon, IonProgressBar } from '@ionic/react';
import { headsetOutline, pause, play, videocamOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { Resource } from '../types';

const formatTime = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

const MediaPlayer: React.FC<{ resource: Resource }> = ({ resource }) => {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Al cambiar de recurso se reinicia el reproductor.
  useEffect(() => {
    setPlaying(false);
    setElapsed(0);
  }, [resource.id]);

  // Avanza un segundo mientras está reproduciendo.
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setElapsed((current) => {
        if (current + 1 >= resource.durationSeconds) {
          setPlaying(false);
          return resource.durationSeconds;
        }
        return current + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [playing, resource.durationSeconds]);

  if (resource.url) {
    return (
      <div className="media-player">
        {resource.type === 'video' ? (
          <video src={resource.url} controls preload="metadata" style={{ width: '100%', display: 'block' }} />
        ) : (
          <audio src={resource.url} controls preload="metadata" style={{ width: '100%', display: 'block' }} />
        )}
      </div>
    );
  }

  return (
    <div className="media-player">
      <div className="media-screen" aria-hidden="true">
        <IonIcon icon={resource.type === 'video' ? videocamOutline : headsetOutline} />
        <span>{resource.type === 'video' ? 'Video' : 'Audio'}</span>
      </div>
      <div className="media-controls">
        <IonButton
          fill="clear"
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? 'Pausar' : 'Reproducir'}
        >
          <IonIcon slot="icon-only" icon={playing ? pause : play} />
        </IonButton>
        <IonProgressBar value={resource.durationSeconds > 0 ? elapsed / resource.durationSeconds : 0} aria-hidden="true" />
        <span className="media-time">
          {formatTime(elapsed)} / {formatTime(resource.durationSeconds)}
        </span>
      </div>
    </div>
  );
};

export default MediaPlayer;
