package com.oculus.asistencia.motor.model;

import com.oculus.asistencia.rrhh.model.Empleado;
import com.oculus.asistencia.turnos.model.TurnoPlantilla;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "asistencia_dia")
public class AsistenciaDia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private com.oculus.asistencia.organizacion.model.Empresa empresa;

    @ManyToOne(optional = false)
    @JoinColumn(name = "empleado_id")
    private Empleado empleado;

    @Column(name = "fecha_laboral", nullable = false)
    private LocalDate fechaLaboral;

    @ManyToOne
    @JoinColumn(name = "turno_asignado_id")
    private TurnoPlantilla turnoAsignado;

    @Column(name = "hora_entrada_real")
    private LocalDateTime horaEntradaReal;

    @Column(name = "hora_salida_real")
    private LocalDateTime horaSalidaReal;

    @Column(name = "mins_trabajados_reales")
    private int minsTrabajadosReales;

    @Column(name = "mins_tardanza")
    private int minsTardanza;

    @Column(name = "mins_salida_anticipada")
    private int minsSalidaAnticipada;

    @Column(name = "mins_extra_antes")
    private int minsExtraAntes;

    @Column(name = "mins_extra_despues")
    private int minsExtraDespues;

    @Column(name = "mins_break_tomados")
    private int minsBreakTomados;

    @Column(name = "estado_asistencia", nullable = false)
    @Enumerated(EnumType.STRING)
    private EstadoAsistencia estadoAsistencia;

    private String incidencias;

    @Column(name = "validado_por_supervisor")
    private boolean validadoPorSupervisor;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "asistenciaDia", cascade = CascadeType.ALL)
    private List<AsistenciaSegmento> segmentos;

    public enum EstadoAsistencia {
        NORMAL, FALTA, TARDANZA, INCOMPLETO, FERIADO, LIBRE, REQUIERE_REVISION
    }
}
