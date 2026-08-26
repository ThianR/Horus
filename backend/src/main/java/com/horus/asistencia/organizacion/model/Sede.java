package com.horus.asistencia.organizacion.model;

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
@ToString(exclude = {"empresa", "turnoDefecto", "marcaciones", "dispositivos", "paquetes"})
@EqualsAndHashCode(exclude = {"empresa", "turnoDefecto", "marcaciones", "dispositivos", "paquetes"})
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
    private com.horus.asistencia.turnos.model.TurnoPlantilla turnoDefecto;

    @Builder.Default
    private String diasTurnoDefecto = "LUN,MAR,MIE,JUE,VIE";

    @Builder.Default
    @OneToMany(mappedBy = "sede", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<com.horus.asistencia.marcas.model.MarcacionEvento> marcaciones = new java.util.ArrayList<>();

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "sede", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<Dispositivo> dispositivos = new java.util.ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "sede", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<com.horus.asistencia.biometria.model.PaqueteEmbeddings> paquetes = new java.util.ArrayList<>();
}
