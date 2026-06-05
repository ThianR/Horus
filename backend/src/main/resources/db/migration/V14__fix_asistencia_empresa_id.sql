-- Repara registros historicos de asistencia_dia huerfanos que no tienen empresa_id,
-- cruzando con la tabla empleado y asignandoles su empresa correspondiente.
-- Esto resuelve el problema del dashboard mostrando ceros.

UPDATE asistencia_dia 
SET empresa_id = (SELECT empresa_id FROM empleado e WHERE e.id = asistencia_dia.empleado_id) 
WHERE empresa_id IS NULL;
