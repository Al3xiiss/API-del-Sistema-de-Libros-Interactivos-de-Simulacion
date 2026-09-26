/** Inicio de sesión (FT-02). Figma: "Inicio de Sesión" y "Inicio de Sesión con error". */
import {
  IonButton, IonContent, IonInput, IonInputPasswordToggle, IonNote, IonPage, IonRouterLink, IonSpinner, IonText,
  useIonRouter,
} from '@ionic/react';
import { FormEvent, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { homeForRole } from '../../services/authService';
import { fieldClass, isValidEmail } from '../../utils/validators';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const router = useIonRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailError = !email
    ? 'Ingresa tu correo electrónico.'
    : !isValidEmail(email) ? 'Usa el formato nombre@dominio.cl' : '';
  const passwordError = !password ? 'Ingresa tu contraseña.' : '';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched({ email: true, password: true });
    if (emailError || passwordError) return;

    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      setPassword('');
      setTouched({ email: false, password: false });
      // Redirección según el rol; 'root' reinicia el historial (no se vuelve al login con "atrás").
      router.push(homeForRole(user.role), 'root', 'replace');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className="auth-layout">
          <aside className="auth-hero" aria-hidden="true">
            <h2>Libros Interactivos</h2>
            <p>Historias para acompañarte, a tu ritmo.</p>
          </aside>

          <main className="auth-form">
            <p className="eyebrow">Libros Interactivos</p>
            <h1>Iniciar sesión</h1>
            <form onSubmit={handleSubmit} noValidate>
              <IonInput
                className={fieldClass(touched.email, emailError)}
                label="Correo electrónico *"
                labelPlacement="floating"
                fill="outline"
                type="email"
                autocomplete="email"
                inputmode="email"
                clearInput
                value={email}
                errorText={emailError}
                onIonInput={(e) => setEmail(e.detail.value ?? '')}
                onIonBlur={() => setTouched((t) => ({ ...t, email: true }))}
              />
              <IonInput
                className={fieldClass(touched.password, passwordError)}
                label="Contraseña *"
                labelPlacement="floating"
                fill="outline"
                type="password"
                autocomplete="current-password"
                value={password}
                errorText={passwordError}
                onIonInput={(e) => setPassword(e.detail.value ?? '')}
                onIonBlur={() => setTouched((t) => ({ ...t, password: true }))}
              >
                <IonInputPasswordToggle slot="end" />
              </IonInput>

              {error && (
                <IonText color="danger" role="alert">
                  <p className="form-error">{error}</p>
                </IonText>
              )}

              <IonButton type="submit" expand="block" disabled={loading}>
                {loading ? <IonSpinner name="dots" aria-label="Ingresando" /> : 'Ingresar'}
              </IonButton>
            </form>

            <p className="ion-text-center">
              ¿No tienes cuenta? <IonRouterLink routerLink="/register">Regístrate</IonRouterLink>
            </p>
            <p className="small-note">* Campo obligatorio</p>

            <IonNote className="demo-note">
              Cuentas de prueba (EP1):<br />
              Paciente: paciente@demo.cl / Paciente123<br />
              Administrador: admin@demo.cl / Admin12345
            </IonNote>
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
