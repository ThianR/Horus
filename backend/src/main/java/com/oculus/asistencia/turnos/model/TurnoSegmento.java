package com.oculus.asistencia.turnos.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "turno_segmento")
public class TurnoSegmento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "turno_plantilla_id")
    @com.fasterxml.jackson.annotation.JsonBackReference
    private TurnoPlantilla turnoPlantilla;

    private int orden;

    @Column(name = "hora_entrada", nullable = false)
    private LocalTime horaEntrada;

    @Column(name = "hora_salida", nullable = false)
    private LocalTime horaSalida;

    @Column(name = "dia_siguiente_salida")
    private boolean diaSiguienteSalida;

    @Column(name = "tolerancia_tardanza_mins")
    private int toleranciaTardanzaMins;

    @Column(name = "tolerancia_salida_anticipada_mins")
    private int toleranciaSalidaAnticipadaMins;
}
