# Análisis Funcional - Sistema Horus

Este documento detalla las reglas de negocio, flujos y arquitectura funcional del sistema de control de asistencia biométrica **Horus**.

## 1. Descripción General
Horus es una solución para el control de asistencia en empresas con múltiples sedes. Su principal valor reside en la capacidad de registrar asistencias de forma biométrica (reconocimiento facial) sin necesidad de una conexión permanente a internet en los puntos de registro (kioscos).

## 2. Reglas de Negocio Principales

### 2.1 Precedencia de Parámetros
Las configuraciones de tolerancia y reglas se aplican en el siguiente orden de prioridad:
`Empleado` > `Turno` > `Empresa`

### 2.2 Gestión de Turnos y Horarios
El sistema soporta horarios complejos:
- **Turnos Simples**: Una entrada y una salida.
- **Turnos Partidos**: Múltiples entradas y salidas en un mismo día (ej. horario con almuerzo).
- **Turnos Nocturnos**: Jornadas que inician un día y terminan al día siguiente.

### 2.3 Concepto de Fecha Laboral (Work Date)
Para garantizar la integridad del reporte, el sistema utiliza el concepto de "Fecha Laboral". Toda marcación que ocurra dentro de un turno nocturno será consolidada en la fecha en que inició la jornada, facilitando el cálculo de horas trabajadas y extras sin cortes artificiales a medianoche.

### 2.4 Control de Evidencias
- Se captura una foto por cada marcación exitosa.
- **Retención**: La imagen física se conserva por 60 días para auditoría visual.
- **Purgado**: Pasados los 60 días, el sistema elimina las imágenes pero mantiene los metadatos y el hash (SHA-256) de la imagen original para validar la integridad histórica.

## 3. Flujos Funcionales

### 3.1 Registro de Marcación (Kiosco)
1. El empleado se posiciona frente a la cámara.
2. El sistema realiza la detección (liveness) y el reconocimiento facial (1:N) contra la base local de la sede.
3. Se genera un evento con marca de tiempo local y UUID único.
4. El evento se almacena en una cola local si no hay conexión.

### 3.2 Sincronización
1. El dispositivo intenta enviar los eventos pendientes al servidor central.
2. El servidor valida la duplicidad mediante el UUID (idempotencia).
3. El motor de asistencia procesa el evento y actualiza la hoja de asistencia del empleado para el día correspondiente.

### 3.3 Motor de Asistencia (MotorAsistenciaService)
El motor es el cerebro del sistema. Realiza:
- Asignación de marcas a slots esperados.
- Cálculo de minutos de tardanza y salida anticipada.
- Cálculo de horas extra (pre y post turno) con redondeo configurable.
- Identificación de incidencias (Incompleto, Falta, Requiere Revisión).

## 4. Roles y Permisos
- **Administrador**: Control total del sistema.
- **RRHH**: Gestión de empleados, sedes y reportes globales.
- **Supervisor**: Aprobación de permisos y revisión de asistencia de su equipo.
- **Empleado**: Consulta de marcaciones y solicitud de permisos.
