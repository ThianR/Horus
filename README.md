# Sistema de Control de Asistencias Biométrico - Horus

Sistema de gestión de asistencia con soporte para marca biométrica, operación offline y sincronización inteligente.
Desarrollado en Java + Spring Boot 3 con arquitectura modular.

**Repositorio oficial:** [https://github.com/ThianR/Horus.git](https://github.com/ThianR/Horus.git)

## Requisitos Previos
- **Java 21** instalado.
- **Maven 3.8+** (configurado en el path).
- **Node.js** (para el frontend Vite).
- **Python 3.10+** (para el microservicio de biometría).

## Estructura del Proyecto
- `frontend/`: Cliente web SPA desarrollado con Vite.
- `backend/`: Servidor API REST (Spring Boot 3 + Java 21).
- `python-service/`: Microservicio de reconocimiento facial (FastAPI + DeepFace).
- `data/`: Base de datos local SQLite (se genera automáticamente).

## Cómo Ejecutar (Full Stack)

La forma más sencilla de ejecutar todo el ecosistema es utilizar el script de arranque principal ubicado en la raíz del proyecto. Este script levantará el Frontend, el motor de Inteligencia Artificial y el Backend en paralelo.

1. Abrir una terminal en la raíz del proyecto.
2. Copiar el archivo `.env.example` como `.env` y configurar los valores requeridos.
3. Ejecutar el script por lotes:
   ```bash
   .\ejecutar_sistema.bat
   ```

Una vez que el script finalice de levantar los servicios, el sistema estará disponible en:
- **Frontend (Web):** `http://localhost:5173`
- **Backend (API):** `http://localhost:8000`
- **Biometría (IA Swagger):** `http://localhost:8001/docs`

## Documentación de Endpoints Principales

### Sincronización / Offline
- **POST** `/api/sincronizacion/subir-eventos`
  - Sube un lote de marcaciones desde el kiosco. Es idempotente (verifica UUIDs).
- **GET** `/api/sincronizacion/descargar-cambios`
  - Descarga empleados y configuraciones para actualizar el kiosco offline.

### Biometría y Marcaciones
- **POST** `/api/marcaciones/registrar`
  - Registra una marcación individual (online).
- **POST** `http://localhost:8001/api/v1/extract` *(Python Service)*
  - Extrae el vector de características faciales (embedding) de una imagen.

### Reportes
- **GET** `/api/reportes/asistencia.csv`
  - Descarga el reporte histórico de asistencias.

## Configuración y Base de Datos
- Las variables de entorno globales se leen desde el `.env` en la raíz (recomendado para desarrollo).
- La configuración específica de Spring Boot está en `backend/src/main/resources/application.properties`.
- Por defecto se utiliza SQLite en modo archivo con persistencia en: `./data/horus_db.db`.
