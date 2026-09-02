package com.horus.asistencia.marcas.model;

import com.horus.asistencia.organizacion.model.Dispositivo;
import com.horus.asistencia.organizacion.model.Sede;
import com.horus.asistencia.rrhh.model.Empleado;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "marcacion_evento")
public class MarcacionEvento {
    @Id
    @Column(length = 36)
    private String uuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private com.horus.asistencia.organizacion.model.Empresa empresa;

    @ManyToOne
    @JoinColumn(name = "empleado_id")
    private Empleado empleado;

    @ManyToOne
    @JoinColumn(name = "dispositivo_id")
    private Dispositivo dispositivo;

    @ManyToOne
    @JoinColumn(name = "sede_id")
    private Sede sede;

    @Column(name = "timestamp_evento", nullable = false)
    private LocalDateTime timestampEvento;

    @Column(name = "timestamp_servidor")
    private LocalDateTime timestampServidor;

    @Column(name = "tipo_evento", nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoEvento tipoEvento;

    @Column(name = "metodo_verificacion")
    private String metodoVerificacion;

    // Biometría
    @Column(name = "similitud_score")
    private Double similitudScore;

    @Column(name = "liveness_score")
    private Double livenessScore;

    @Column(name = "liveness_status")
    @Enumerated(EnumType.STRING)
    private LivenessStatus livenessStatus;

    @Column(name = "evidencia_foto_path")
    private String evidenciaFotoPath;

    @Column(name = "evidencia_foto_hash")
    private String evidenciaFotoHash;

    // Estado Procesamiento
    @Column(name = "estado_proceso")
    @Enumerated(EnumType.STRING)
    private EstadoProceso estadoProceso;

    @Column(name = "error_motivo")
    private String errorMotivo;

    public enum TipoEvento {
        ENTRADA, SALIDA, INICIO_BREAK, FIN_BREAK, DESCONOCIDO
    }

    public enum LivenessStatus {
        PASSED, FAILED, UNKNOWN
    }

    public enum EstadoProceso {
        PENDIENTE, PROCESADO, ERROR
    }
}
