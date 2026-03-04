package com.oculus.asistencia.organizacion.dto;

import lombok.Data;

@Data
public class AsignarTurnoSedeDto {
    private Long turnoDefectoId; // Puede ser null si se quiere quitar el turno por defecto
    private String diasTurnoDefecto;
}
