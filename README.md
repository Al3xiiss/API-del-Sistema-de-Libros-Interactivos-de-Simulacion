# API-del-Sistema-de-Libros-Interactivos-de-Simulación
# 📖 Sistema de Libros Interactivos de Simulación de Acompañamiento Oncológico

![Ionic](https://img.shields.io/badge/Ionic-3880FF?style=for-the-badge&logo=ionic&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

##  Equipo de Desarrollo y Responsabilidades
- **Alexis Escobar**: Desarrollo de código frontend (Ionic + React), estructuración técnica y lógica de componentes.
- **Gabriel Fuentes**: Redacción de informes, justificación del problema, investigación de fuentes y documentación.
- **Geraldine Allende**: Diseño de UI/UX, creación de mockups en Figma y modelado de diagramas.

##  Descripción General
Aplicación web y móvil, acompañada de su API REST, orientada a administrar y utilizar el contenido de libros interactivos de acompañamiento oncológico. El sistema gestiona capítulos, simulaciones narrativas, personajes, recursos multimedia y el seguimiento del progreso individual. 

> **Aviso Importante:** Esta plataforma tiene un enfoque educativo y de acompañamiento psicosocial. No constituye una herramienta de diagnóstico médico ni sustituye la atención de profesionales de la salud.

##  Objetivos y Problema que Aborda
*(Esta sección se expandirá con la documentación del EP 1.2, abordando la fragmentación de la información y las necesidades psicosociales).*

##  Principales Funcionalidades
A continuación se detallan las funcionalidades clave del sistema, separadas de los flujos básicos de registro e inicio de sesión[cite: 1]:
- **RF-01 Gestión de Libros:** Administración completa (crear, editar, eliminar) del catálogo de libros.
- **RF-02 Navegación de Capítulos:** Acceso estructurado al contenido narrativo.
- **RF-03 Ejecución de Simulación:** Activación de entornos interactivos.
- **RF-04 Toma de Decisiones:** Registro de elecciones mediante variables booleanas para evaluar caminos y ramificar la historia.
- **RF-05 Reproducción Multimedia:** Integración fluida de video y audio complementario.
- **RF-06 Consulta de Progreso:** Seguimiento y estadísticas de avance del usuario.
- **RF-07 Gestión de Personajes:** Creación y asociación de perfiles a las simulaciones narrativas.

##  Tecnologías y Herramientas
- **Frontend:** Ionic Framework con React[cite: 1].
- **Backend (Próximas entregas):** Node.js (Express) o Flask (Python)[cite: 1].
- **Base de Datos:** PostgreSQL o MySQL (Relacional)[cite: 1].
- **Seguridad:** JSON Web Tokens (JWT) y encriptación bcrypt[cite: 1].
- **Despliegue:** Capacitor (Web/Móvil) y Docker (Contenedores)[cite: 1].

##  Instrucciones de Instalación y Ejecución
### Prerrequisitos
- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- Ionic CLI: 
  ```bash
  npm install -g @ionic/cli
