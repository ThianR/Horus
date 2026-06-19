-- Datos de Prueba para Sistema Oculus (Versión Simplificada)

INSERT OR IGNORE INTO sede (id, nombre, direccion, codigo_externo, version_embeddings) 
VALUES 
(1, 'Sede Central', 'Av. España 1234, Asunción', 'SC-001', 1),
(2, 'Sucursal Este', 'Ruta 2 Km 15, Ciudad del Este', 'SE-002', 1),
(3, 'Sucursal Norte', 'Av. Mariscal López 5678, San Lorenzo', 'SN-003', 1);

INSERT OR IGNORE INTO empleado (id, codigo_empleado, numero_documento, nombre_completo, email, estado) 
VALUES
(1, 'EMP-001', '1234567', 'Juan Pérez González', 'juan.perez@oculus.com', 'ACTIVO'),
(2, 'EMP-002', '2345678', 'María García Rodríguez', 'maria.garcia@oculus.com', 'ACTIVO'),
(3, 'EMP-003', '3456789', 'Carlos López Martínez', 'carlos.lopez@oculus.com', 'ACTIVO'),
(4, 'EMP-004', '4567890', 'Ana Fernández Silva', 'ana.fernandez@oculus.com', 'ACTIVO'),
(5, 'EMP-005', '5678901', 'Roberto Sánchez Torres', 'roberto.sanchez@oculus.com', 'ACTIVO'),
(6, 'EMP-006', '6789012', 'Laura Martínez Gómez', 'laura.martinez@oculus.com', 'ACTIVO'),
(7, 'EMP-007', '7890123', 'Diego Ramírez Castro', 'diego.ramirez@oculus.com', 'INACTIVO'),
(8, 'EMP-008', '8901234', 'Patricia Díaz Morales', 'patricia.diaz@oculus.com', 'ACTIVO');

INSERT OR IGNORE INTO empleado_sede_habilitada (empleado_id, sede_id, fecha_desde, activo) 
VALUES
(1, 1, '2024-01-01 00:00:00.000', TRUE),
(2, 1, '2024-01-01 00:00:00.000', TRUE),
(3, 2, '2024-02-01 00:00:00.000', TRUE),
(4, 2, '2024-02-01 00:00:00.000', TRUE),
(5, 3, '2024-03-01 00:00:00.000', TRUE),
(6, 1, '2024-01-15 00:00:00.000', TRUE),
(7, 2, '2024-02-01 00:00:00.000', FALSE),
(8, 3, '2024-03-01 00:00:00.000', TRUE);

INSERT OR IGNORE INTO turno_plantilla (id, codigo, nombre, tipo_turno, es_nocturno) 
VALUES
(1, 'TM-001', 'Turno Mañana', 'FIJO', FALSE),
(2, 'TT-002', 'Turno Tarde', 'FIJO', FALSE),
(3, 'TN-003', 'Turno Noche', 'FIJO', TRUE),
(4, 'TF-004', 'Turno Flexible', 'FLEXIBLE', FALSE);

INSERT OR IGNORE INTO turno_segmento (turno_plantilla_id, orden, hora_entrada, hora_salida, tolerancia_tardanza_mins, tolerancia_salida_anticipada_mins) 
VALUES
(1, 1, '1970-01-01 07:00:00.000', '1970-01-01 15:00:00.000', 10, 10),
(2, 1, '1970-01-01 15:00:00.000', '1970-01-01 23:00:00.000', 10, 10),
(3, 1, '1970-01-01 23:00:00.000', '1970-01-01 07:00:00.000', 15, 15),
(4, 1, '1970-01-01 08:00:00.000', '1970-01-01 17:00:00.000', 15, 15);

INSERT OR IGNORE INTO asignacion_turno (empleado_id, turno_plantilla_id, fecha_inicio) 
VALUES
(1, 1, '2024-01-01 00:00:00.000'),
(2, 1, '2024-01-01 00:00:00.000'),
(3, 2, '2024-02-01 00:00:00.000'),
(4, 2, '2024-02-01 00:00:00.000'),
(5, 3, '2024-03-01 00:00:00.000'),
(6, 1, '2024-01-15 00:00:00.000'),
(8, 3, '2024-03-01 00:00:00.000');
