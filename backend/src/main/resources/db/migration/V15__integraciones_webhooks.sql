CREATE TABLE integracion_api_key (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_api_key_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

CREATE TABLE webhook_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    url VARCHAR(500) NOT NULL,
    secret_key VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_webhook_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);
