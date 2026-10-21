// Reglas de validación para los datos que llegan en el cuerpo (body) de cada peticion
// Son las mismas reglas que muestra el formulario de registro del frontend

import { body } from 'express-validator';

export const reglasRegistro = [
  body('alias')
    .isString().withMessage('El alias es obligatorio')
    .trim()
    .matches(/^[a-zA-Z0-9_.]{3,20}$/)
    .withMessage('El alias debe tener entre 3 y 20 caracteres (letras, números, punto o guion bajo)'),
  body('email')
    .isString().withMessage('El correo es obligatorio')
    .trim()
    .toLowerCase()
    .isEmail().withMessage('El correo no es válido')
    .isLength({ max: 255 }).withMessage('El correo es demasiado largo'),
  body('password')
    .isString().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8, max: 72 }).withMessage('La contraseña debe tener entre 8 y 72 caracteres')
    .matches(/[A-Z]/).withMessage('La contraseña debe tener al menos una letra mayúscula')
    .matches(/\d/).withMessage('La contraseña debe tener al menos un número'),
];

export const reglasLogin = [
  body('email')
    .isString().withMessage('El correo es obligatorio')
    .trim()
    .toLowerCase()
    .isEmail().withMessage('El correo no es válido'),
  body('password')
    .isString().withMessage('La contraseña es obligatoria')
    .notEmpty().withMessage('La contraseña es obligatoria'),
];