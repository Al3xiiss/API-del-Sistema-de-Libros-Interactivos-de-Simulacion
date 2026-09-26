/** Validaciones de formularios compartidas por login, registro y panel admin. */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ALIAS_REGEX = /^[a-zA-Z0-9_.]{3,20}$/;

export const isValidEmail = (value: string) => EMAIL_REGEX.test(value.trim());

export const isValidAlias = (value: string) => ALIAS_REGEX.test(value.trim());

/** Reglas de contraseña que se muestran en tiempo real en el registro. */
export const passwordRules = (value: string) => [
  { label: 'Al menos 8 caracteres', ok: value.length >= 8 },
  { label: 'Una letra mayúscula', ok: /[A-Z]/.test(value) },
  { label: 'Un número', ok: /\d/.test(value) },
];

export const isStrongPassword = (value: string) => passwordRules(value).every((rule) => rule.ok);

/**
 * Clases que IonInput usa para mostrar `errorText` (rojo) o el estado válido.
 * Solo se marca un campo después de que el usuario lo tocó.
 */
export const fieldClass = (touched: boolean, error: string) => {
  if (!touched) return '';
  return error ? 'ion-touched ion-invalid' : 'ion-touched ion-valid';
};
