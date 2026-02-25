package com.oculus.asistencia.turnos.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "turno_plantilla")
public class TurnoPlantilla {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String codigo;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "tipo_turno", nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoTurno tipoTurno;

    @Column(name = "es_nocturno")
    private boolean esNocturno;

    @Column(name = "min_break_mins")
    private int minBreakMins;

    @Column(name = "max_break_mins")
    private int maxBreakMins;

    @Column(name = "tolerancia_entrada_mins")
    private int toleranciaEntradaMins;

    @Column(name = "tolerancia_salida_mins")
    private int toleranciaSalidaMins;

    @OneToMany(mappedBy = "turnoPlantilla", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private List<TurnoSegmento> segmentos;

    public enum TipoTurno {
        FIJO, FLEXIBLE, ABIERTO
    }
}
