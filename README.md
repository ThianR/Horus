# Sistema de Control de Asistencias Biométrico - Oculus

Sistema de gestión de asistencia con soporte para marca biométrica, operación offline y sincronización inteligente.
Desarrollado en Java + Spring Boot 3 con arquitectura modular.

## Requisitos Previos
- **Java 17** o superior instalado.
- **Maven** (opcional, wrapper incluido).

## Estructura del Proyecto
- `backend/`: Código fuente del servidor API REST.
- `backend/src/main/resources/db/migration`: Scripts SQL de base de datos (Flyway).
- `data/`: Base de datos local H2 (se crea automáticamente).

## Cómo Ejecutar

### Backend
1. Abrir terminal en la raíz del proyecto.
2. Ejecutar el script por lotes que inicializa las variables de Java 21:
   ```bash
   .\ejecutar_backend.bat
   ```
   *⚠️ Nota Crítica de Entorno: No uses `mvn spring-boot:run` directamente en la terminal si tu `JAVA_HOME` global está apuntando a Java 8 (NetBeans 8), ya que fallará la compilación. El script resolvió las rutas localmente para usar el JDK-21 y Maven 3.8.8 internos.*

3. La API estará disponible en `http://localhost:8000`.
   - Swagger/OpenAPI (si habilitado): `http://localhost:8080/swagger-ui.html`

## Documentación de Endpoints Principales

### Sincronización / Offline
- **POST** `/api/sincronizacion/subir-eventos`
  - Sube un lote de marcaciones desde el kiosco. Es idempotente (verifica UUIDs).
- **GET** `/api/sincronizacion/descargar-cambios`
  - Descarga empleados y configuraciones para actualizar el kiosco offline.

### Marcaciones
- **POST** `/api/marcaciones/registrar`
  - Registra una marcación individual (online).

### Reportes
- **GET** `/api/reportes/asistencia.csv`
  - Descarga el reporte histórico de asistencias.

## Configuración
La configuración principal está en `backend/src/main/resources/application.properties`.
Por defecto usa H2 en modo archivo: `./data/oculus_db`.

## Scripts Útiles
- `ejecutar_backend.bat`: Script para iniciar el servidor en Windows.
