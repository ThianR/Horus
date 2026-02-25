package com.oculus.asistencia.motor.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "regla_asistencia")
public class ReglaAsistencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_alcance")
    private NivelAlcance nivelAlcance;

    @Column(name = "entidad_id")
    private Long entidadId;

    @Column(name = "tolerancia_entrada")
    private Integer toleranciaEntrada = 0;

    @Column(name = "tolerancia_salida")
    private Integer toleranciaSalida = 0;

    @Column(name = "tolerancia_break")
    private Integer toleranciaBreak = 0;

    @Column(name = "redondeo_entrada")
    private Integer redondeoEntrada = 0;

    @Column(name = "redondeo_salida")
    private Integer redondeoSalida = 0;

    @Column(name = "permite_horas_extra")
    private boolean permiteHorasExtra = false;

    @Column(name = "min_mins_para_extra")
    private Integer minMinsParaExtra = 30;

    private boolean activo = true;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public enum NivelAlcance {
        GLOBAL, SEDE, TURNO, EMPLEADO
    }
}
