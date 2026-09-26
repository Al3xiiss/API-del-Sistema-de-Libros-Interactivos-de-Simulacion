/**
 * Registro de paciente (FT-01). Figma: "Registrarse", "con error" y "con éxito".
 * Se pide un alias en vez del nombre real para proteger la identidad del paciente.
 */
import {
  IonButton, IonCheckbox, IonContent, IonIcon, IonInput, IonInputPasswordToggle, IonPage,
  IonRouterLink, IonSpinner, IonText, useIonRouter, useIonToast,
} from '@ionic/react';
import { checkmarkCircle, ellipseOutline } from 'ionicons/icons';
import { FormEvent, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fieldClass, isStrongPassword, isValidAlias, isValidEmail, passwordRules } from '../../utils/validators';

const EMPTY_FORM = { alias: '', email: '', password: '', confirm: '' };
type Field = keyof typeof EMPTY_FORM | 'terms';

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [terms, setTerms] = useState(false);
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    alias: false, email: false, password: false, confirm: false, terms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const errors: Record<Field, string> = {
    alias: isValidAlias(form.alias) ? '' : 'Entre 3 y 20 caracteres: letras, números, "_" o ".".',
    email: isValidEmail(form.email) ? '' : 'Usa el formato nombre@dominio.cl',
    password: isStrongPassword(form.password) ? '' : 'La contraseña no cumple los requisitos.',
    confirm: form.confirm && form.confirm === form.password ? '' : 'Las contraseñas no coinciden.',
    terms: terms ? '' : 'Debes aceptar los términos para crear tu cuenta.',
  };

  const setField = (field: keyof typeof EMPTY_FORM, value: string) => setForm((f) => ({ ...f, [field]: value }));
  const touch = (field: Field) => setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched({ alias: true, email: true, password: true, confirm: true, terms: true });
    if (Object.values(errors).some(Boolean)) return;

    setLoading(true);
    setError('');
    try {
      await register({ alias: form.alias, email: form.email, password: form.password });
      await presentToast({ message: 'Cuenta creada. Ya puedes iniciar sesión.', duration: 2500, color: 'success', position: 'top' });
      setForm(EMPTY_FORM);
      setTerms(false);
      router.push('/login', 'back', 'replace');
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
            <h2>Crea tu espacio</h2>
            <p>Tu identidad y tu progreso son confidenciales.</p>
          </aside>

          <main className="auth-form">
            <p className="eyebrow">Libros Interactivos</p>
            <h1>Registro de paciente</h1>
            <form onSubmit={handleSubmit} noValidate>
              <IonInput
                className={fieldClass(touched.alias, errors.alias)}
                label="Nombre de usuario (alias) *"
                labelPlacement="floating"
                fill="outline"
                autocomplete="username"
                clearInput
                value={form.alias}
                helperText="No uses tu nombre real. Ej: elena_r"
                errorText={errors.alias}
                onIonInput={(e) => setField('alias', e.detail.value ?? '')}
                onIonBlur={() => touch('alias')}
              />
              <IonInput
                className={fieldClass(touched.email, errors.email)}
                label="Correo electrónico *"
                labelPlacement="floating"
                fill="outline"
                type="email"
                autocomplete="email"
                inputmode="email"
                clearInput
                value={form.email}
                helperText="Solo lo usamos para iniciar sesión."
                errorText={errors.email}
                onIonInput={(e) => setField('email', e.detail.value ?? '')}
                onIonBlur={() => touch('email')}
              />
              <IonInput
                className={fieldClass(touched.password, errors.password)}
                label="Contraseña *"
                labelPlacement="floating"
                fill="outline"
                type="password"
                autocomplete="new-password"
                value={form.password}
                errorText={errors.password}
                onIonInput={(e) => setField('password', e.detail.value ?? '')}
                onIonBlur={() => touch('password')}
              >
                <IonInputPasswordToggle slot="end" />
              </IonInput>

              {/* Indicador de seguridad de la contraseña en tiempo real */}
              <ul className="password-rules" aria-label="Requisitos de la contraseña">
                {passwordRules(form.password).map((rule) => (
                  <li key={rule.label} className={rule.ok ? 'ok' : ''}>
                    <IonIcon aria-hidden="true" icon={rule.ok ? checkmarkCircle : ellipseOutline} />
                    {rule.label}
                  </li>
                ))}
              </ul>

              <IonInput
                className={fieldClass(touched.confirm, errors.confirm)}
                label="Confirmar contraseña *"
                labelPlacement="floating"
                fill="outline"
                type="password"
                autocomplete="new-password"
                value={form.confirm}
                errorText={errors.confirm}
                onIonInput={(e) => setField('confirm', e.detail.value ?? '')}
                onIonBlur={() => touch('confirm')}
              >
                <IonInputPasswordToggle slot="end" />
              </IonInput>

              <IonCheckbox
                checked={terms}
                labelPlacement="end"
                justify="start"
                onIonChange={(e) => {
                  setTerms(e.detail.checked);
                  touch('terms');
                }}
              >
                <span className="ion-text-wrap">Acepto los términos, condiciones y política de privacidad *</span>
              </IonCheckbox>
              {touched.terms && errors.terms && (
                <IonText color="danger"><p className="form-error">{errors.terms}</p></IonText>
              )}

              {error && (
                <IonText color="danger" role="alert"><p className="form-error">{error}</p></IonText>
              )}

              <IonButton type="submit" expand="block" disabled={loading}>
                {loading ? <IonSpinner name="dots" aria-label="Creando cuenta" /> : 'Registrarse'}
              </IonButton>
            </form>

            <p className="ion-text-center">
              ¿Ya tienes cuenta? <IonRouterLink routerLink="/login" routerDirection="back">Inicia sesión</IonRouterLink>
            </p>
            <p className="small-note">* Campo obligatorio</p>
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;
