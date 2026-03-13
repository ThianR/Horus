package com.oculus.asistencia.organizacion.controller;

import com.oculus.asistencia.organizacion.model.Dispositivo;
import com.oculus.asistencia.organizacion.repository.DispositivoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dispositivos")
@RequiredArgsConstructor
public class DispositivoController {

    private final DispositivoRepository dispositivoRepository;

    @GetMapping("/validar/{uuid}")
    public ResponseEntity<?> validarDispositivo(@PathVariable String uuid) {
        return dispositivoRepository.findByUuidHardware(uuid)
                .map(disp -> {
                    if (disp.getEstado() != Dispositivo.EstadoDispositivo.ACTIVO) {
                        System.out.println("Validación FALLIDA: Dispositivo encontrado [" + uuid + "] pero está en estado " + disp.getEstado());
                        return ResponseEntity.badRequest()
                            .body(java.util.Map.of("mensaje", "El dispositivo no se encuentra activo"));
                    }
                    return ResponseEntity.ok(java.util.Map.of(
                        "id", disp.getId(),
                        "nombre", disp.getNombre(),
                        "sedeId", disp.getSede().getId(),
                        "empresaId", disp.getEmpresa().getId(),
                        "tipo", disp.getTipo()
                    ));
                })
                .orElseGet(() -> {
                    System.out.println("Validación FALLIDA: No se encontró dispositivo con UUID [" + uuid + "]");
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping
    public List<Dispositivo> listarTodos(@RequestParam(required = false) Long empresaId) {
        if (empresaId != null) {
            return dispositivoRepository.findAllByEmpresaId(empresaId);
        }
        return java.util.Collections.emptyList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dispositivo> obtenerPorId(@PathVariable Long id) {
        return dispositivoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Dispositivo dispositivo) {
        if (!dispositivoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        // Validar unicidad de UUID si se está intentando cambiar o activar
        java.util.Optional<Dispositivo> existente = dispositivoRepository.findByUuidHardware(dispositivo.getUuidHardware());
        if (existente.isPresent() && !existente.get().getId().equals(id) && 
            existente.get().getEstado() == Dispositivo.EstadoDispositivo.ACTIVO &&
            dispositivo.getEstado() == Dispositivo.EstadoDispositivo.ACTIVO) {
            return ResponseEntity.badRequest()
                .body(java.util.Map.of("mensaje", "Este dispositivo ya se encuentra activo en otra sede o empresa (" + existente.get().getSede().getNombre() + ")"));
        }

        dispositivo.setId(id);

        // Mantener la sede original si no se manda en la request, pero idealmente se
        // pasa integra.
        Dispositivo current = dispositivoRepository.findById(id).orElse(null);
        if (current != null) {
            if (dispositivo.getSede() == null) {
                dispositivo.setSede(current.getSede());
            }
            if (dispositivo.getEmpresa() == null) {
                dispositivo.setEmpresa(current.getEmpresa());
            }
        }

        Dispositivo updated = dispositivoRepository.save(dispositivo);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!dispositivoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        dispositivoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
