# Roadmap de Desarrollo - Proyecto Horus

Este documento traza la ruta evolutiva del sistema **Horus**, desde su estado actual de MVP técnico hacia una solución robusta de nivel empresarial.

## Fase 1: Consolidación del Core e Interfaz Web (Próximo paso)
**Objetivo**: Transformar el motor técnico en una herramienta usable.
- [ ] **Desarrollo de Panel Admin (Web)**: Creación de interfaz para RRHH y Administradores (React/Vite).
    - Gestión de empleados, sedes y dispositivos.
    - Configuración visual de plantillas de turnos complejos.
    - Dashboard de asistencia en tiempo real.
- [ ] **Frontend de Kiosco**: Interfaz simplificada y optimizada para pantallas táctiles.
    - Feedback visual post-marcación.
    - Modo offline con base de datos local (IndexedDB/SQLite local).
- [ ] **Seguridad Core**: Implementación de Spring Security con JWT para la API.

## Fase 2: Biometría Real y Liveness Avanzado
**Objetivo**: Reemplazar los Stubs por una integración biométrica real.
- [ ] **Integración de InsightFace**: Implementación de servicio local para generación de embeddings.
- [ ] **Liveness Real**: Integración de modelos anti-spoofing (detección de fotos/videos presentados a cámara).
- [ ] **Enrolamiento Centralizado**: Flujo UI para captura de plantilla base del empleado desde el panel central.
- [ ] **Sincronización de Deltas**: Optimización del endpoint de embeddings para enviar solo actualizaciones mínimas a las sedes.

## Fase 3: Movilidad y Experiencia del Empleado
**Objetivo**: Extender el sistema a los dispositivos personales de los empleados.
- [ ] **App Móvil (Empleado/Supervisor)**:
    - Autoconsulta de marcaciones y horarios.
    - Solicitud de permisos y vacaciones desde el móvil.
    - Marcación por geocerca (geofencing) para personal de campo.
- [ ] **Notificaciones Push**: Alertas por tardanzas, ausencias o aprobación de permisos.

## Fase 4: Escalamiento y Alta Disponibilidad
**Objetivo**: Preparar el sistema para miles de empleados y sedes.
- [ ] **Migración a PostgreSQL**: Transición de SQLite (embebida) a una base de datos de alto rendimiento.
- [ ] **Dockerización**: Containerización de módulos para despliegue simplificado en servidores de sede y nube.
- [ ] **Motor de Reportes Avanzado**: Generación programada de reportes con envío automático por email (JasperReports o similar).
- [ ] **Audit Log Detallado**: Registro inmutable de cambios en configuraciones y marcaciones manuales.

## Fase 5: IA Predictiva y Análisis de Datos
**Objetivo**: Aportar valor estratégico mediante el análisis proactivo.
- [ ] **IA de Predicción de Ausentismo**: Identificación de patrones de falta de asistencia.
- [ ] **Optimización de Turnos**: Sugerencias automáticas de horarios basadas en la carga laboral histórica.
- [ ] **Integración con Nómina (Payroll)**: Exportación compatible con sistemas de pago locales.
