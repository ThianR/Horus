package com.horus.asistencia.reportes.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NominaEmpleadoDto {
    private Long empleadoId;
    private String nombreCompleto;
    private String codigoEmpleado;
    private String numeroDocumento;

    private int totalDiasTrabajados;
    private int totalDiasFalta;
    private int totalDiasLicencia;

    private int totalMinsTrabajados;
    private int totalMinsTardanza;
    private int totalMinsExtra;

    public double getTotalHorasTrabajadas() {
        return totalMinsTrabajados / 60.0;
    }

    public double getTotalHorasExtra() {
        return totalMinsExtra / 60.0;
    }

    public double getTotalHorasTardanza() {
        return totalMinsTardanza / 60.0;
    }
}
