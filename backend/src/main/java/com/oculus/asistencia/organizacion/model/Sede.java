package com.oculus.asistencia.organizacion.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sede")
public class Sede {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Empresa empresa;

    @Column(nullable = false)
    private String nombre;

    private String direccion;

    @Column(name = "codigo_externo")
    private String codigoExterno;

    @Column(name = "configuracion_json")
    private String configuracionJson;

    @Column(name = "version_embeddings")
    private Long versionEmbeddings;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turno_defecto_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "segmentos" })
    private com.oculus.asistencia.turnos.model.TurnoPlantilla turnoDefecto;

    @Column(name = "dias_turno_defecto")
    private String diasTurnoDefecto = "LUN,MAR,MIE,JUE,VIE";

    @OneToMany(mappedBy = "sede", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<com.oculus.asistencia.marcas.model.MarcacionEvento> marcaciones = new java.util.ArrayList<>();

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "sede", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<Dispositivo> dispositivos = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "sede", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<com.oculus.asistencia.biometria.model.PaqueteEmbeddings> paquetes = new java.util.ArrayList<>();
}
