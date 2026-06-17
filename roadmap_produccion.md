# Roadmap a Producción: Oculus Asistencia

Este documento detalla las áreas clave que deben abordarse antes de comercializar el sistema a clientes finales, asegurando estabilidad, seguridad y profesionalismo.

## 1. Cambio de Base de Datos (Crítico)
Actualmente el sistema utiliza **H2 Database** (basada en archivos locales). H2 es excelente para desarrollo, pero en producción puede corromperse bajo concurrencia y carece de herramientas robustas de backup.
- [ ] Migrar a **PostgreSQL** o **MySQL**.
- [ ] Configurar un sistema de backups automáticos diarios de la base de datos.
- [ ] Separar las credenciales de base de datos usando variables de entorno seguras en el servidor.

## 2. Empaquetado y Despliegue (Docker)
Entregar el software copiando carpetas y ejecutando archivos `.bat` es propenso a errores dependiendo de la máquina del cliente (falta de Java, Python, Node, etc.).
- [ ] **Dockerizar el Backend** (Spring Boot).
- [ ] **Dockerizar el Frontend** (Nginx sirviendo los estáticos de React).
- [ ] **Dockerizar el Motor Biométrico** (Python/DeepFace).
- [ ] Crear un archivo `docker-compose.yml` unificado para que la instalación en el servidor del cliente sea mediante un solo comando (`docker-compose up -d`).

## 3. Escalabilidad del Motor Biométrico (IA)
DeepFace es pesado computacionalmente. Si múltiples quioscos de diferentes sedes intentan marcar la entrada al mismo tiempo (ej. 08:00 AM), el servicio en Python podría colapsar o responder con lentitud.
- [ ] Implementar un sistema de encolamiento (ej. RabbitMQ o Redis) para las peticiones biométricas.
- [ ] Opcional: Separar el servicio Python en un servidor con GPU (Nvidia) si se proyecta gran cantidad de empleados.

## 4. Seguridad de Red y Certificados (SSL/HTTPS)
Vender un producto moderno requiere conexiones encriptadas.
- [ ] Implementar **HTTPS real** con certificados SSL (ej. Let's Encrypt o ZeroSSL) usando un proxy inverso (Nginx o Traefik).
- [ ] Configurar Rate Limiting (límite de peticiones por IP) en Spring Security para evitar ataques de fuerza bruta en el Login.

## 5. Módulo de Correos y Notificaciones (SMTP)
Un sistema comercial necesita comunicarse automáticamente con sus usuarios.
- [ ] Configurar servidor SMTP (SendGrid, AWS SES, o Mailgun).
- [ ] Recuperación de contraseña automatizada por correo.
- [ ] Envío automático de notificaciones a supervisores cuando hay justificaciones de ausencias o llegadas tardías constantes.

## 6. Monitoreo y Observabilidad
Si el sistema falla en el servidor de un cliente, necesitas saber por qué sin tener que pedirle que te pase archivos de texto manuales.
- [ ] Implementar **Sentry** (o similar) en Frontend y Backend para reporte automático de errores en tiempo real.
- [ ] Sistema de rotación de logs más robusto y centralizado.

## 7. QA y Pruebas Automatizadas
- [ ] Escribir pruebas unitarias (JUnit) para el motor de cálculos de tardanzas/horas extra (es la parte donde no puede haber errores porque afecta el salario de los empleados).

---

> [!TIP]
> **Estrategia Recomendada:**
> No es necesario hacer todo esto a la vez. El paso más urgente y obligatorio antes de instalar en el primer cliente real es el **Paso 1 (PostgreSQL)** y el **Paso 2 (Docker)**. Con eso ya puedes empezar a facturar como "instalación On-Premise".
