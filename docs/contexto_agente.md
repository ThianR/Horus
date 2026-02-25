# Contexto del Proyecto Oculus (Para Agentes de IA)

Este documento proporciona el contexto necesario para que un agente de IA comprenda, mantenga o extienda el sistema **Oculus**.

## 🎯 Propósito del Proyecto
Oculus es un sistema de **Control de Asistencias Biométrico** diseñado para operar en entornos con conectividad limitada (offline). Permite el registro de entradas y salidas mediante reconocimiento facial y validación de liveness en kioscos locales, sincronizando los datos con un servidor central cuando hay conexión.

## 🛠️ Stack Tecnológico
- **Backend**: Java 17+, Spring Boot 3.2.1.
- **Base de Datos**: H2 (modo archivo) gestionado por Flyway.
- **Arquitectura**: Monolito Modular. Los módulos están delimitados por paquetes en `com.oculus.asistencia`.
- **Idioma**: Estricto **Español** en nombres de clases, variables, base de datos, endpoints y mensajes.

## 🧩 Estructura de Módulos
1.  **identidad**: Gestión de usuarios y roles (ADMIN, RRHH, SUPERVISOR, EMPLEADO).
2.  **rrhh**: Información de empleados y su habilitación en sedes.
3.  **organizacion**: Definición de sedes y dispositivos (kioscos, cámaras).
4.  **turnos**: Definición de plantillas horarias (fijas, flexibles, nocturnas).
5.  **marcas**: Registro crudo de eventos de marcación.
6.  **motor**: Lógica central que procesa marcas y genera asistencias diarias.
7.  **sync**: Endpoints para la sincronización idempotente de eventos y descarga de datos base.
8.  **biometria**: Stubs para reconocimiento facial y limpieza de evidencias (fotos).

## 💡 Conceptos Clave para el Agente
- **Fecha Laboral (Work Date)**: Para turnos que cruzan la medianoche, la fecha de la asistencia no siempre coincide con la fecha del calendario de la marcación (ej. una salida a las 06:00 AM del martes pertenece a la fecha laboral del lunes). Ver `MotorAsistenciaService.determinarFechaLaboral`.
- **Idempotencia**: Todas las marcaciones sincronizadas deben usar el `event_uuid` original del dispositivo para evitar duplicados en el servidor.
- **Privacidad**: Las evidencias (fotos) se eliminan tras 60 días, conservando solo el hash y metadatos para auditoría.

## 🚀 Restricciones Críticas
1.  **Offline-First**: La arquitectura debe permitir que un kiosco funcione 100% desconectado tras la sincronización inicial de empleados y embeddings.
2.  **Modularidad**: Evitar dependencias circulares. Usar interfaces si es necesario comunicar módulos.
3.  **Localización**: No usar términos en inglés a menos que sean técnicos inevitables (ej. "UUID", "REST").
