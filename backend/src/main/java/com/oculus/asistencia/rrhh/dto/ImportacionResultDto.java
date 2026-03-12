package com.oculus.asistencia.rrhh.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class ImportacionResultDto {
    private int procesados = 0;
    private List<String> errores = new ArrayList<>();
    
    public void addError(String error) {
        this.errores.add(error);
    }
    
    public void incrementProcesados() {
        this.procesados++;
    }
}
