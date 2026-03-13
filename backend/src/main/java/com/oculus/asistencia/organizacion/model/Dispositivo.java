package com.oculus.asistencia.organizacion.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"empresa", "sede", "marcaciones"})
@EqualsAndHashCode(exclude = {"empresa", "sede", "marcaciones"})
@Entity
@Table(name = "dispositivo")
public class Dispositivo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Empresa empresa;

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

    @OneToMany(mappedBy = "dispositivo", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<com.oculus.asistencia.marcas.model.MarcacionEvento> marcaciones = new java.util.ArrayList<>();

    public enum TipoDispositivo {
        KIOSCO, CAMARA, MOVIL
    }

    public enum EstadoDispositivo {
        ACTIVO, INACTIVO, MANTENIMIENTO
    }
}
