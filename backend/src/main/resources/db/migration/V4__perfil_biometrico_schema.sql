-- Agregar columna para almacenar el vector de características (embedding)
-- Usamos BLOB para almacenar el arreglo de floats serializado o bytes
ALTER TABLE perfil_biometrico ADD COLUMN embedding BLOB;
ALTER TABLE perfil_biometrico ADD COLUMN formato VARCHAR(20) DEFAULT 'FLOAT32_128';
