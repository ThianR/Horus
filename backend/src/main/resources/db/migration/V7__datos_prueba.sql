-- Datos de Prueba para Sistema Oculus (Versión Simplificada)

-- Sedes
INSERT INTO sede (nombre, direccion, codigo_externo, version_embeddings) VALUES
('Sede Central', 'Av. España 1234, Asunción', 'SC-001', 1),
('Sucursal Este', 'Ruta 2 Km 15, Ciudad del Este', 'SE-002', 1),
('Sucursal Norte', 'Av. Mariscal López 5678, San Lorenzo', 'SN-003', 1);

-- Empleados
INSERT INTO empleado (codigo_empleado, numero_documento, nombre_completo, email, estado) VALUES
('EMP-001', '1234567', 'Juan Pérez González', 'juan.perez@oculus.com', 'ACTIVO'),
('EMP-002', '2345678', 'María García Rodríguez', 'maria.garcia@oculus.com', 'ACTIVO'),
('EMP-003', '3456789', 'Carlos López Martínez', 'carlos.lopez@oculus.com', 'ACTIVO'),
('EMP-004', '4567890', 'Ana Fernández Silva', 'ana.fernandez@oculus.com', 'ACTIVO'),
('EMP-005', '5678901', 'Roberto Sánchez Torres', 'roberto.sanchez@oculus.com', 'ACTIVO'),
('EMP-006', '6789012', 'Laura Martínez Gómez', 'laura.martinez@oculus.com', 'ACTIVO'),
('EMP-007', '7890123', 'Diego Ramírez Castro', 'diego.ramirez@oculus.com', 'INACTIVO'),
('EMP-008', '8901234', 'Patricia Díaz Morales', 'patricia.diaz@oculus.com', 'ACTIVO');

-- Habilitar empleados en sedes
INSERT INTO empleado_sede_habilitada (empleado_id, sede_id, fecha_desde, activo) VALUES
(1, 1, '2024-01-01', TRUE),
(2, 1, '2024-01-01', TRUE),
(3, 2, '2024-02-01', TRUE),
(4, 2, '2024-02-01', TRUE),
(5, 3, '2024-03-01', TRUE),
(6, 1, '2024-01-15', TRUE),
(7, 2, '2024-02-01', FALSE),
(8, 3, '2024-03-01', TRUE);

-- Turnos Plantilla
INSERT INTO turno_plantilla (codigo, nombre, tipo_turno, es_nocturno) VALUES
('TM-001', 'Turno Mañana', 'FIJO', FALSE),
('TT-002', 'Turno Tarde', 'FIJO', FALSE),
('TN-003', 'Turno Noche', 'FIJO', TRUE),
('TF-004', 'Turno Flexible', 'FLEXIBLE', FALSE);

-- Segmentos de Turno
INSERT INTO turno_segmento (turno_plantilla_id, orden, hora_entrada, hora_salida, tolerancia_tardanza_mins, tolerancia_salida_anticipada_mins) VALUES
(1, 1, '07:00:00', '15:00:00', 10, 10),
(2, 1, '15:00:00', '23:00:00', 10, 10),
(3, 1, '23:00:00', '07:00:00', 15, 15),
(4, 1, '08:00:00', '17:00:00', 15, 15);

-- Asignaciones de Turno
INSERT INTO asignacion_turno (empleado_id, turno_plantilla_id, fecha_inicio) VALUES
(1, 1, '2024-01-01'),
(2, 1, '2024-01-01'),
(3, 2, '2024-02-01'),
(4, 2, '2024-02-01'),
(5, 3, '2024-03-01'),
(6, 1, '2024-01-15'),
(8, 3, '2024-03-01');
