package com.oculus.asistencia.organizacion.controller;

import com.oculus.asistencia.organizacion.model.Dispositivo;
import com.oculus.asistencia.organizacion.model.Sede;
import com.oculus.asistencia.organizacion.repository.DispositivoRepository;
import com.oculus.asistencia.organizacion.repository.SedeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sedes")
@RequiredArgsConstructor
public class SedeController {

    private final SedeRepository sedeRepository;
    private final DispositivoRepository dispositivoRepository;

    @GetMapping
    public List<Sede> listarSedes() {
        return sedeRepository.findAll();
    }

    @PostMapping
    public Sede crearSede(@RequestBody Sede sede) {
        return sedeRepository.save(sede);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sede> obtenerPorId(@PathVariable Long id) {
        return sedeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sede> actualizar(@PathVariable Long id, @RequestBody Sede sede) {
        if (!sedeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        sede.setId(id);
        Sede updated = sedeRepository.save(sede);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!sedeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        sedeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Gestión básica de dispositivos por sede
    @GetMapping("/{sedeId}/dispositivos")
    public List<Dispositivo> listarDispositivos(@PathVariable Long sedeId) {
        return dispositivoRepository.findBySedeId(sedeId);
    }

    @PostMapping("/{sedeId}/dispositivos")
    public ResponseEntity<Dispositivo> registrarDispositivo(@PathVariable Long sedeId,
            @RequestBody Dispositivo dispositivo) {
        return sedeRepository.findById(sedeId).map(sede -> {
            dispositivo.setSede(sede);
            return ResponseEntity.ok(dispositivoRepository.save(dispositivo));
        }).orElse(ResponseEntity.notFound().build());
    }
}
