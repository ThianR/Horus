package com.oculus.asistencia.organizacion.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "dispositivo")
public class Dispositivo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "uuid_hardware", nullable = false, unique = true)
    private String uuidHardware;

    @ManyToOne
    @JoinColumn(name = "sede_id")
    private Sede sede;

    private String nombre;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoDispositivo tipo;

    @Enumerated(EnumType.STRING)
    private EstadoDispositivo estado;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_heartbeat")
    private LocalDateTime lastHeartbeat;

    public enum TipoDispositivo {
        KIOSCO, CAMARA, MOVIL
    }

    public enum EstadoDispositivo {
        ACTIVO, INACTIVO, MANTENIMIENTO
    }
}
