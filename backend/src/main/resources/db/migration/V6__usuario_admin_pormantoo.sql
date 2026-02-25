-- Usuario Administrador por defecto (admin / admin123)
-- Hash BCrypt para 'admin123'
INSERT INTO usuario (username, password_hash, rol, activo) 
VALUES ('admin', '$2a$10$vO.vHj1gNlYfC6f4/v6.reM28tO8K4Y6M.F6zB8c2I/X5G7mB8z1e', 'ADMIN', TRUE);
