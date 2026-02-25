# Arquitectura Técnica - Sistema Oculus

Este documento detalla la estructura técnica, componentes y decisiones de diseño implementadas en el backend de **Oculus**.

## 1. Stack Tecnológico
- **Java 17**: Uso de records, switch expressions y APIs modernas.
- **Spring Boot 3.2**: Framework base.
- **Spring Data JPA**: Abstracción de persistencia.
- **H2 Database**: Base de datos SQL embebida (configurada en modo persistente en `./data/oculus_db`).
- **Flyway**: Gestión de migraciones de esquema.
- **Lombok**: Reducción de código boilerplate (getters, setters, constructores).

## 2. Estructura del Proyecto (Monolito Modular)
El proyecto adopta un enfoque modular basado en paquetes internos. Cada paquete principal actúa como un módulo funcional con su propia lógica de persistencia y servicio.

```text
com.oculus.asistencia
├── biometria     # Stubs faciales, limpieza de fotos antiguos
├── identidad     # Usuarios, roles, seguridad
├── marcas        # Registro crudo de eventos (MarcacionEvento)
├── motor         # Lógica core de asistencia (AsistenciaDia, Segmentos)
├── organizacion  # Sedes y Dispositivos
├── rrhh          # Gestión de Empleados y habilitación de sedes
├── sync          # Controladores para sincronización offline
└── turnos        # Plantillas de horarios (TurnoPlantilla, Segmento)
```

## 3. Modelo de Datos Clave

### 3.1 MarcacionEvento
Es la tabla de "datos crudos". Utiliza un **UUID** generado por el dispositivo origen para garantizar la **idempotencia** durante la sincronización. Si llega un evento con un UUID que ya existe, el servidor lo ignora.

### 3.2 Motor de Asistencia
El motor (`MotorAsistenciaService`) transforma `MarcacionEvento` en una entidad `AsistenciaDia`.
- **Lógica de Cruce de Medianoche**: Se basa en la bandera `esNocturno` de la plantilla de turno.
- **Tolerancias**: Se calculan comparando contra los `TurnoSegmento`.

## 4. Endpoints de Sincronización
La API está optimizada para clientes que operan a veces desconectados.
- `/api/sincronizacion/subir-eventos`: Acepta una lista (`List<MarcacionDto>`). Procesa cada ítem de forma aislada, permitiendo fallos parciales sin abortar el lote.
- `/api/sincronizacion/descargar-cambios`: Diseñado para enviar solo los deltas (empleados recién creados o actualizaciones) a los kioscos.

## 5. Mantenimiento y Extensibilidad
- **Migraciones**: Todo cambio en base de datos debe pasar por `src/main/resources/db/migration`.
- **Simulación**: El sistema incluye interfaces para biometría que permiten pruebas sin necesidad de hardware real o librerías nativas complejas en desarrollo.
- **Limpieza (Purge)**: `EvidenciaCleanupService` usa `@Scheduled` para automatizar la eliminación de evidencias biométricas pesadas.
