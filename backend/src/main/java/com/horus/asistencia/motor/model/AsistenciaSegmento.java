package com.horus.asistencia.motor.model;

import com.horus.asistencia.marcas.model.MarcacionEvento;
import com.horus.asistencia.turnos.model.TurnoSegmento;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "asistencia_segmento")
public class AsistenciaSegmento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "asistencia_dia_id")
    private AsistenciaDia asistenciaDia;

    @ManyToOne
    @JoinColumn(name = "turno_segmento_id")
    private TurnoSegmento turnoSegmento;

    @ManyToOne
    @JoinColumn(name = "marcacion_entrada_uuid")
    private MarcacionEvento marcacionEntrada;

    @ManyToOne
    @JoinColumn(name = "marcacion_salida_uuid")
    private MarcacionEvento marcacionSalida;

    @Enumerated(EnumType.STRING)
    private EstadoSegmento estado;

    public enum EstadoSegmento {
        COMPLETADO, SIN_SALIDA, SIN_ENTRADA
    }
}
