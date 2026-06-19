-- 1. Tablas Base
CREATE TABLE IF NOT EXISTS empresa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    identificacion_fiscal VARCHAR(255) UNIQUE,
    direccion VARCHAR(255),
    telefono VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    cierre_dia_automatico BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('ADMIN', 'RRHH', 'SUPERVISOR', 'EMPLEADO')),
    activo BOOLEAN DEFAULT TRUE,
    empresa_id INTEGER DEFAULT 1 REFERENCES empresa(id),
    tour_completado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS turno_plantilla (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(50) NOT NULL,
    empresa_id INTEGER DEFAULT 1 REFERENCES empresa(id),
    nombre VARCHAR(100) NOT NULL,
    tipo_turno VARCHAR(20) NOT NULL CHECK (tipo_turno IN ('FIJO', 'FLEXIBLE', 'ABIERTO')),
    es_nocturno BOOLEAN DEFAULT FALSE,
    min_break_mins INTEGER DEFAULT 0,
    max_break_mins INTEGER DEFAULT 0,
    tolerancia_entrada_mins INTEGER DEFAULT 0,
    tolerancia_salida_mins INTEGER DEFAULT 0,
    CONSTRAINT uk_turno_codigo_empresa UNIQUE (codigo, empresa_id)
);

CREATE TABLE IF NOT EXISTS turno_segmento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    turno_plantilla_id INTEGER NOT NULL REFERENCES turno_plantilla(id),
    orden INTEGER NOT NULL,
    hora_entrada TIME NOT NULL,
    hora_salida TIME NOT NULL,
    dia_siguiente_salida BOOLEAN DEFAULT FALSE,
    tolerancia_tardanza_mins INTEGER DEFAULT 0,
    tolerancia_salida_anticipada_mins INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sede (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255),
    codigo_externo VARCHAR(50),
    configuracion_json TEXT,
    version_embeddings INTEGER DEFAULT 0,
    empresa_id INTEGER DEFAULT 1 REFERENCES empresa(id),
    turno_defecto_id INTEGER REFERENCES turno_plantilla(id),
    dias_turno_defecto VARCHAR(255) DEFAULT 'LUN,MAR,MIE,JUE,VIE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dispositivo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid_hardware VARCHAR(100) NOT NULL UNIQUE,
    sede_id INTEGER REFERENCES sede(id),
    empresa_id INTEGER DEFAULT 1 REFERENCES empresa(id),
    nombre VARCHAR(100),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('KIOSCO', 'CAMARA', 'MOVIL')),
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    ip_address VARCHAR(50),
    last_heartbeat TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS empleado (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER UNIQUE REFERENCES usuario(id),
    supervisor_id INTEGER REFERENCES empleado(id),
    codigo_empleado VARCHAR(50) NOT NULL,
    empresa_id INTEGER DEFAULT 1 REFERENCES empresa(id),
    numero_documento VARCHAR(20) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_empleado_codigo_empresa UNIQUE (codigo_empleado, empresa_id)
);

CREATE TABLE IF NOT EXISTS empleado_sede_habilitada (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empleado_id INTEGER NOT NULL REFERENCES empleado(id),
    sede_id INTEGER NOT NULL REFERENCES sede(id),
    fecha_desde DATE NOT NULL,
    fecha_hasta DATE,
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT uk_emp_sede_vigencia UNIQUE (empleado_id, sede_id, fecha_desde)
);

CREATE TABLE IF NOT EXISTS asignacion_turno (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empleado_id INTEGER NOT NULL REFERENCES empleado(id),
    turno_plantilla_id INTEGER NOT NULL REFERENCES turno_plantilla(id),
    empresa_id INTEGER DEFAULT 1 REFERENCES empresa(id),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    dias_semana VARCHAR(50) DEFAULT 'LUN,MAR,MIE,JUE,VIE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS marcacion_evento (
    uuid VARCHAR(36) PRIMARY KEY,
    empleado_id INTEGER REFERENCES empleado(id),
    dispositivo_id INTEGER REFERENCES dispositivo(id),
    sede_id INTEGER REFERENCES sede(id),
    empresa_id INTEGER DEFAULT 1 REFERENCES empresa(id),
    timestamp_evento TIMESTAMP NOT NULL,
    timestamp_servidor TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_evento VARCHAR(20) NOT NULL CHECK (tipo_evento IN ('ENTRADA', 'SALIDA', 'INICIO_BREAK', 'FIN_BREAK', 'DESCONOCIDO')),
    metodo_verificacion VARCHAR(50) DEFAULT 'FACIAL',
    similitud_score DOUBLE,
    liveness_score DOUBLE,
    liveness_status VARCHAR(20) CHECK (liveness_status IN ('PASSED', 'FAILED', 'UNKNOWN')),
    evidencia_foto_path VARCHAR(255),
    evidencia_foto_hash VARCHAR(100),
    estado_proceso VARCHAR(20) DEFAULT 'PENDIENTE',
    error_motivo TEXT
);

CREATE TABLE IF NOT EXISTS marcacion_intento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid VARCHAR(36),
    empleado_id_raw INTEGER,
    empresa_id INTEGER DEFAULT 1 REFERENCES empresa(id),
    timestamp_cliente TIMESTAMP,
    timestamp_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_evento VARCHAR(50),
    metodo_verificacion VARCHAR(50),
    exito BOOLEAN DEFAULT FALSE,
    error_motivo VARCHAR(500),
    payload_original TEXT
);

CREATE TABLE IF NOT EXISTS asistencia_dia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empleado_id INTEGER NOT NULL REFERENCES empleado(id),
    empresa_id INTEGER DEFAULT 1 REFERENCES empresa(id),
    fecha_laboral DATE NOT NULL,
    turno_asignado_id INTEGER REFERENCES turno_plantilla(id),
    hora_entrada_real TIMESTAMP,
    hora_salida_real TIMESTAMP,
    mins_trabajados_reales INTEGER DEFAULT 0,
    mins_tardanza INTEGER DEFAULT 0,
    mins_salida_anticipada INTEGER DEFAULT 0,
    mins_extra_antes INTEGER DEFAULT 0,
    mins_extra_despues INTEGER DEFAULT 0,
    mins_break_tomados INTEGER DEFAULT 0,
    estado_asistencia VARCHAR(30) NOT NULL CHECK (estado_asistencia IN ('NORMAL', 'FALTA', 'TARDANZA', 'INCOMPLETO', 'FERIADO', 'LIBRE', 'REQUIERE_REVISION')),
    incidencias TEXT,
    validado_por_supervisor BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_asistencia_dia_emp UNIQUE (empleado_id, fecha_laboral)
);

CREATE TABLE IF NOT EXISTS asistencia_segmento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asistencia_dia_id INTEGER NOT NULL REFERENCES asistencia_dia(id),
    turno_segmento_id INTEGER REFERENCES turno_segmento(id),
    marcacion_entrada_uuid VARCHAR(36) REFERENCES marcacion_evento(uuid),
    marcacion_salida_uuid VARCHAR(36) REFERENCES marcacion_evento(uuid),
    estado VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS permiso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empleado_id INTEGER NOT NULL REFERENCES empleado(id),
    solicitado_por INTEGER REFERENCES usuario(id),
    aprobado_por INTEGER REFERENCES usuario(id),
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo VARCHAR(50) NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    es_dia_complete BOOLEAN DEFAULT TRUE,
    motivo TEXT,
    comentario_aprobador TEXT,
    estado VARCHAR(20) DEFAULT 'SOLICITADO' CHECK (estado IN ('SOLICITADO', 'APROBADO', 'RECHAZADO', 'CANCELADO'))
);

CREATE TABLE IF NOT EXISTS solicitud_ausencia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empleado_id INTEGER NOT NULL REFERENCES empleado(id),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    motivo VARCHAR(500),
    comentario_revisor VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS perfil_biometrico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empleado_id INTEGER NOT NULL REFERENCES empleado(id),
    empresa_id INTEGER DEFAULT 1 REFERENCES empresa(id),
    version INTEGER DEFAULT 1,
    activo BOOLEAN DEFAULT TRUE,
    embedding BLOB,
    formato VARCHAR(20) DEFAULT 'FLOAT32_128',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS paquete_embeddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sede_id INTEGER REFERENCES sede(id),
    version INTEGER NOT NULL,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    url_descarga VARCHAR(255),
    hash_paquete VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS regla_asistencia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    nivel_alcance VARCHAR(20) NOT NULL CHECK (nivel_alcance IN ('GLOBAL', 'SEDE', 'TURNO', 'EMPLEADO')),
    entidad_id INTEGER,
    tolerancia_entrada INTEGER DEFAULT 0,
    tolerancia_salida INTEGER DEFAULT 0,
    tolerancia_break INTEGER DEFAULT 0,
    redondeo_entrada INTEGER DEFAULT 0,
    redondeo_salida INTEGER DEFAULT 0,
    permite_horas_extra BOOLEAN DEFAULT FALSE,
    min_mins_para_extra INTEGER DEFAULT 30,
    activo BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS integracion_api_key (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL REFERENCES empresa(id),
    api_key_hash VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webhook_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL REFERENCES empresa(id),
    url VARCHAR(500) NOT NULL,
    secret_key VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Datos por defecto e Iniciales (Idempotentes para SQLite)

INSERT OR IGNORE INTO empresa (id, nombre, identificacion_fiscal, activo) 
VALUES (1, 'Empresa Demo/Default', '00000000-0', TRUE);

INSERT OR IGNORE INTO usuario (id, username, password_hash, rol, activo, empresa_id) 
VALUES (1, 'admin', '$2a$10$0ht/DM8vJwIH.U0X1R9wd.RkyH0xDj7EcqQ3gHQP7t9YQlauF6qD.', 'ADMIN', TRUE, 1);

INSERT OR IGNORE INTO regla_asistencia (id, nombre, nivel_alcance, tolerancia_entrada, redondeo_entrada, permite_horas_extra) 
VALUES (1, 'REGLA GLOBAL DEFAULT', 'GLOBAL', 15, 0, TRUE);
