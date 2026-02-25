-- Usuario Admin para Testing (Idempotente)
-- Contraseña: admin123 (BCrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy)

-- MERGE permite re-ejecutar esta migración sin errores
MERGE INTO usuario (username, password_hash, rol, activo)
KEY(username)
VALUES ('admin', '$2a$10$dKCLYMOM28GpaMyPwKqn4.PtAd.z..A/BLP0.HYHnD/GZF9PlvJXa', 'ADMIN', TRUE);
