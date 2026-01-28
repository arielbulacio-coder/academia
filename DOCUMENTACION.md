# Documentación del Proyecto Academia

## Descripción General
Plataforma educativa para cursos de formación profesional y técnica. Incluye gestión de cursos, unidades, materiales didácticos, inscripciones y calificaciones.
Recientemente se ha integrado Inteligencia Artificial (Google Gemini) para la generación automática de material didáctico y evaluaciones.
Además, se incluye el módulo **Medical PredictAI** con entrenamiento basado en CatBoost para el diagnóstico institucional.

## Credenciales de Acceso (Servidor DonWeb)
El proyecto está desplegado en el mismo servidor VPS que Consultora y Golf.

- **IP:** `149.50.130.160`
- **Usuario:** `root`
- **Llave SSH:** `c:\ProyectosGit\consultora\keys\id_ed25519_donweb` (Compartida)
- **Acceso:**
  ```bash
  ssh -i c:\ProyectosGit\consultora\keys\id_ed25519_donweb root@149.50.130.160
  ```

## Nuevas Funcionalidades IA (Enero 2026)

### 1. Generación de Material Didáctico (PDF)
- **Ubicación:** Botón con icono de "Destello" (Sparkles) en el encabezado de cada Unidad en `CourseDetail`.
- **Funcionalidad:**
  - Permite al instructor ingresar un tema y cantidad de hojas.
  - Genera automáticamente un PDF estructurado (Título, Intro, Desarrollo, Conclusión).
  - Opcionamente genera una evaluación parcial (Multiple Choice) y/o examen final.
- **Backend Endpoint:** `POST /cursos/:cursoId/unidades/:unidadId/generar-material-pdf`

### 2. Auto-evaluación y Calificación
- **Funcionalidad:**
  - Los alumnos pueden rendir las evaluaciones generadas.
  - El sistema corrige automáticamente las respuestas (Multiple Choice).
  - Asigna una nota (0-100) y guarda el registro en `Calificacion`.
- **Backend Endpoint:** `POST /evaluaciones/:id/entregar`

## Despliegue
Se utiliza el script unificado `deploy_apps_fix.ps1` ubicado en el directorio de Consultora.
```powershell
cd c:\ProyectosGit\consultora
.\deploy_apps_fix.ps1
```
Este script despliega `consultora`, `academia` y otros servicios definidos.

## Variables de Entorno Relevantes
- `GEMINI_API_KEY`: Clave de API de Google Gemini (Backend `courses-service`).
