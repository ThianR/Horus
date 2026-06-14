package com.oculus.asistencia.organizacion.controller;

import com.oculus.asistencia.organizacion.model.Dispositivo;
import com.oculus.asistencia.organizacion.model.Sede;
import com.oculus.asistencia.organizacion.repository.DispositivoRepository;
import com.oculus.asistencia.organizacion.repository.SedeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sedes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SedeController {

    private final SedeRepository sedeRepository;
    private final DispositivoRepository dispositivoRepository;
    private final com.oculus.asistencia.organizacion.service.EmpresaService empresaService;
    private final com.oculus.asistencia.organizacion.repository.EmpresaRepository empresaRepository;
    private final com.oculus.asistencia.turnos.repository.TurnoPlantillaRepository turnoRepository;

    @GetMapping
    public List<Sede> listarSedes(@RequestParam(required = false) Long empresaId) {
        if (empresaId != null) {
            return sedeRepository.findAllByEmpresaId(empresaId);
        }
        return java.util.Collections.emptyList();
    }

    @PostMapping
    public ResponseEntity<Sede> crearSede(@RequestBody Sede sede, @RequestParam(required = false) Long empresaId) {
        if (empresaId != null) {
            return empresaRepository.findById(empresaId).map(emp -> {
                sede.setEmpresa(emp);
                return ResponseEntity.ok(sedeRepository.save(sede));
            }).orElse(ResponseEntity.badRequest().build());
        } else {
            sede.setEmpresa(empresaService.getEmpresaDefault());
            return ResponseEntity.ok(sedeRepository.save(sede));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sede> obtenerPorId(@PathVariable Long id) {
        return sedeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sede> actualizar(@PathVariable Long id, @RequestBody Sede sede) {
        return sedeRepository.findById(id).map(existing -> {
            existing.setNombre(sede.getNombre());
            existing.setDireccion(sede.getDireccion());
            existing.setCodigoExterno(sede.getCodigoExterno());
            // No cambiamos la empresa en una actualización simple de sede
            return ResponseEntity.ok(sedeRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/turno-defecto")
    public ResponseEntity<Sede> asignarTurnoDefecto(@PathVariable Long id,
            @RequestBody com.oculus.asistencia.organizacion.dto.AsignarTurnoSedeDto dto) {
        return sedeRepository.findById(id).map(sede -> {
            if (dto.getTurnoDefectoId() != null) {
                com.oculus.asistencia.turnos.model.TurnoPlantilla turno = turnoRepository
                        .findById(dto.getTurnoDefectoId())
                        .orElseThrow(() -> new RuntimeException("Turno no encontrado"));
                sede.setTurnoDefecto(turno);
                if (dto.getDiasTurnoDefecto() != null) {
                    sede.setDiasTurnoDefecto(dto.getDiasTurnoDefecto());
                }
            } else {
                sede.setTurnoDefecto(null);
                sede.setDiasTurnoDefecto(null);
            }
            return ResponseEntity.ok(sedeRepository.save(sede));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        if (!sedeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        try {
            sedeRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("mensaje", "No se puede eliminar la sede porque está siendo utilizada por empleados u otros registros."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("mensaje", "Ocurrió un error inesperado al eliminar la sede."));
        }
    }

    // Gestión básica de dispositivos por sede
    @GetMapping("/{sedeId}/dispositivos")
    public List<Dispositivo> listarDispositivos(@PathVariable Long sedeId) {
        return dispositivoRepository.findBySedeId(sedeId);
    }

    @PostMapping("/{sedeId}/dispositivos")
    public ResponseEntity<?> registrarDispositivo(@PathVariable Long sedeId,
            @RequestBody Dispositivo dispositivo) {
        // Validar unicidad si viene con estado ACTIVO
        java.util.Optional<Dispositivo> existente = dispositivoRepository.findByUuidHardware(dispositivo.getUuidHardware());
        if (existente.isPresent() && existente.get().getEstado() == Dispositivo.EstadoDispositivo.ACTIVO && 
            dispositivo.getEstado() == Dispositivo.EstadoDispositivo.ACTIVO) {
            return ResponseEntity.badRequest()
                .body(java.util.Map.of("mensaje", "Este dispositivo ya se encuentra activo en otra sede (" + existente.get().getSede().getNombre() + ")"));
        }

        return sedeRepository.findById(sedeId).map(sede -> {
            dispositivo.setSede(sede);
            dispositivo.setEmpresa(sede.getEmpresa()); // Heredar empresa de la sede
            return ResponseEntity.ok(dispositivoRepository.save(dispositivo));
        }).orElse(ResponseEntity.notFound().build());
    }
}
