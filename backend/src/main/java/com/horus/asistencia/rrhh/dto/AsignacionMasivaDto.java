package com.horus.asistencia.rrhh.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class AsignacionMasivaDto {
    private List<Long> empleadoIds;
    private Long turnoId;
    private String diasSemana;
    private LocalDate fechaInicio;
}
