package com.horus.asistencia.motor.controller;

import com.horus.asistencia.motor.model.AsistenciaDia;
import com.horus.asistencia.motor.repository.AsistenciaDiaRepository;
import com.horus.asistencia.organizacion.service.EmpresaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/asistencias")
@RequiredArgsConstructor
public class AsistenciaController {

    private final AsistenciaDiaRepository asistenciaRepository;
    private final EmpresaService empresaService;

    @GetMapping
    public ResponseEntity<List<AsistenciaDia>> getAsistenciasMensuales() {
        // Obtiene las asistencias del mes actual (del 1 al último día)
        LocalDate hoy = LocalDate.now();
        LocalDate inicioMes = hoy.withDayOfMonth(1);
        LocalDate finMes = hoy.withDayOfMonth(hoy.lengthOfMonth());
        
        List<AsistenciaDia> asistencias = asistenciaRepository
            .findAllByEmpresaIdAndFechaLaboralBetweenOrderByFechaLaboralDesc(
                empresaService.getEmpresaDefault().getId(),
                inicioMes,
                finMes
            );
            
        return ResponseEntity.ok(asistencias);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AsistenciaDia> actualizarAsistencia(
            @PathVariable Long id, 
            @RequestBody AsistenciaUpdateDto dto) {
            
        return asistenciaRepository.findById(id).map(asistencia -> {
            // Verificar pertenencia a la empresa
            if (!asistencia.getEmpresa().getId().equals(empresaService.getEmpresaDefault().getId())) {
                throw new RuntimeException("Acceso denegado: El registro no pertenece a su empresa.");
            }

            if (dto.horaEntradaReal() != null) {
                asistencia.setHoraEntradaReal(dto.horaEntradaReal());
            }
            if (dto.horaSalidaReal() != null) {
                asistencia.setHoraSalidaReal(dto.horaSalidaReal());
            }
            if (dto.estadoAsistencia() != null) {
                asistencia.setEstadoAsistencia(AsistenciaDia.EstadoAsistencia.valueOf(dto.estadoAsistencia()));
            }
            if (dto.incidencias() != null) {
                asistencia.setIncidencias(dto.incidencias());
            }
            
            // Forzar marca de validación manual
            asistencia.setValidadoPorSupervisor(true);
            
            AsistenciaDia actualizada = asistenciaRepository.save(asistencia);
            return ResponseEntity.ok(actualizada);
        }).orElse(ResponseEntity.notFound().build());
    }

    public record AsistenciaUpdateDto(
        LocalDateTime horaEntradaReal,
        LocalDateTime horaSalidaReal,
        String estadoAsistencia,
        String incidencias
    ) {}
}
