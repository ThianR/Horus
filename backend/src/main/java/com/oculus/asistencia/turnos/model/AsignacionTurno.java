package com.oculus.asistencia.turnos.model;

import com.oculus.asistencia.rrhh.model.Empleado;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "asignacion_turno")
public class AsignacionTurno {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "empleado_id")
    private Empleado empleado;

    @ManyToOne(optional = false)
    @JoinColumn(name = "turno_plantilla_id")
    private TurnoPlantilla turnoPlantilla;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "dias_semana")
    private String diasSemana;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
