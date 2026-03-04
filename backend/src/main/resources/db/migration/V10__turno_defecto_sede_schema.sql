-- Agregar columna para turno por defecto a la Sede
ALTER TABLE sede ADD COLUMN turno_defecto_id BIGINT;

-- Agregar Foreign Key para asegurar la integridad referencial
ALTER TABLE sede ADD CONSTRAINT fk_sede_turno_defecto
    FOREIGN KEY (turno_defecto_id) REFERENCES turno_plantilla(id);
