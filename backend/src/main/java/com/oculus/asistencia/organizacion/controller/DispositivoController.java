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
    public ResponseEntity<Dispositivo> actualizar(@PathVariable Long id, @RequestBody Dispositivo dispositivo) {
        if (!dispositivoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        dispositivo.setId(id);

        // Mantener la sede original si no se manda en la request, pero idealmente se
        // pasa integra.
        Dispositivo current = dispositivoRepository.findById(id).orElse(null);
        if (current != null && dispositivo.getSede() == null) {
            dispositivo.setSede(current.getSede());
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
