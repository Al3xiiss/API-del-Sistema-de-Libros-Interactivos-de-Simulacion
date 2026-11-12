# Sistema de Libros Interactivos de Simulación

Aplicación web y móvil que acompaña a pacientes en tratamiento oncológico mediante libros interactivos con simulaciones de decisiones. Desarrollada con Ionic + React, Node.js + Express y PostgreSQL para la asignatura Ingeniería Web y Móvil (PUCV).

## Contenido de cada rama

| Rama | Contenido |
| :--- | :--- |
| [`backend`](https://github.com/Al3xiiss/API-del-Sistema-de-Libros-Interactivos-de-Simulacion/tree/backend) | **Versión más reciente del proyecto completo:** API REST, script SQL, frontend integrado, Docker y documentación completa. |
| [`frontend`](https://github.com/Al3xiiss/API-del-Sistema-de-Libros-Interactivos-de-Simulacion/tree/frontend) | Interfaz en Ionic + React y documentación de los requerimientos. |
| `main` | Solo este archivo de orientación. |

**Documentación completa** (requerimientos, arquitectura, API, seguridad, Docker e instalación): [README de la rama backend](https://github.com/Al3xiiss/API-del-Sistema-de-Libros-Interactivos-de-Simulacion/blob/backend/README.md).

## Ejecutar con Docker

```bash
git clone https://github.com/Al3xiiss/API-del-Sistema-de-Libros-Interactivos-de-Simulacion.git
cd API-del-Sistema-de-Libros-Interactivos-de-Simulacion
git checkout backend
cp .env.example .env    # completar DB_PASSWORD y JWT_SECRET
docker compose up --build -d
```

Después, abrir http://localhost:8080. La instalación sin Docker está en el README de la rama `backend`.

## Integrantes

- Alexis Eduardo Escobar Figueroa — Frontend / Ionic + React
- Geraldine Valentina Allende López — UI/UX y Figma / Documentación
- Gabriel Alejandro Fuentes Sagardia — Backend / Docker / Figma / Documentación y gestión
