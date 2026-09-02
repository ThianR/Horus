package com.horus.asistencia.reportes.controller;

import com.horus.asistencia.reportes.dto.NominaEmpleadoDto;
import com.horus.asistencia.reportes.service.NominaService;
import com.horus.asistencia.organizacion.service.EmpresaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/nomina")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('RRHH')")
public class NominaController {

    private final NominaService nominaService;
    private final EmpresaService empresaService;

    @GetMapping("/resumen")
    public ResponseEntity<List<NominaEmpleadoDto>> getResumenNomina(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        Long empresaId = empresaService.getEmpresaDefault().getId();
        return ResponseEntity.ok(nominaService.calcularNomina(empresaId, inicio, fin));
    }

    @GetMapping("/exportar-excel")
    public ResponseEntity<byte[]> exportarNominaAExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        Long empresaId = empresaService.getEmpresaDefault().getId();
        
        try {
            byte[] fileContent = nominaService.exportarNominaAExcel(empresaId, inicio, fin);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"nomina_" + inicio + "_al_" + fin + ".xlsx\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(fileContent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
