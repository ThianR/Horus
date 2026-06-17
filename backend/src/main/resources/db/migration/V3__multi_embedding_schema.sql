CREATE TABLE muestra_biometrica (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    perfil_biometrico_id BIGINT NOT NULL,
    embedding BLOB NOT NULL,
    etiqueta VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_muestra_perfil FOREIGN KEY (perfil_biometrico_id) REFERENCES perfil_biometrico(id) ON DELETE CASCADE
);

-- Migrar los datos existentes de perfil_biometrico a muestra_biometrica
INSERT INTO muestra_biometrica (perfil_biometrico_id, embedding, etiqueta)
SELECT id, embedding, 'Frontal' FROM perfil_biometrico WHERE embedding IS NOT NULL;

-- Eliminar la columna antigua de perfil_biometrico
ALTER TABLE perfil_biometrico DROP COLUMN embedding;
