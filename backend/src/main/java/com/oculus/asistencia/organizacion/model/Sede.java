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

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
