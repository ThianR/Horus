package com.horus.asistencia.marcas.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Entidad de auditoría para registrar cada intento de marcación que llega al
 * sistema.
 * Esto permite rastrear fallos incluso si la marcación no llega a persistirse
 * en la tabla principal.
 */
@Data
@Entity
@Table(name = "marcacion_intento")
public class MarcacionIntento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    private com.horus.asistencia.organizacion.model.Empresa empresa;

    @Column(length = 36)
    private String uuid;

    @Column(name = "empleado_id_raw")
    private Long empleadoIdRaw;

    @Column(name = "timestamp_cliente")
    private LocalDateTime timestampCliente;

    @Column(name = "timestamp_registro")
    private LocalDateTime timestampRegistro;

    @Column(name = "tipo_evento")
    private String tipoEvento;

    @Column(name = "metodo_verificacion")
    private String metodoVerificacion;

    @Column(name = "exito")
    private boolean exito;

    @Column(name = "error_motivo", length = 500)
    private String errorMotivo;

    @Column(name = "payload_original", columnDefinition = "TEXT")
    private String payloadOriginal;

    @PrePersist
    protected void onCreate() {
        timestampRegistro = LocalDateTime.now();
    }
}
