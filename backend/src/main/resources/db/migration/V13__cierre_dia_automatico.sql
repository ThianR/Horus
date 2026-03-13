-- Migración para añadir el cierre de día automático a la empresa
ALTER TABLE empresa ADD COLUMN cierre_dia_automatico BOOLEAN DEFAULT FALSE;
