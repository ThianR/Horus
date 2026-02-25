package com.oculus.asistencia.turnos.controller;

import com.oculus.asistencia.turnos.model.TurnoPlantilla;
import com.oculus.asistencia.turnos.repository.TurnoPlantillaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turnos")
@RequiredArgsConstructor
public class TurnoController {

    private final TurnoPlantillaRepository turnoRepository;

    @GetMapping
    public ResponseEntity<List<TurnoPlantilla>> listarTodos() {
        return ResponseEntity.ok(turnoRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TurnoPlantilla> obtenerPorId(@PathVariable Long id) {
        return turnoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TurnoPlantilla> crear(@RequestBody TurnoPlantilla turno) {
        vincularSegmentos(turno);
        TurnoPlantilla saved = turnoRepository.save(turno);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TurnoPlantilla> actualizar(@PathVariable Long id, @RequestBody TurnoPlantilla turno) {
        if (!turnoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        turno.setId(id);
        vincularSegmentos(turno);
        TurnoPlantilla updated = turnoRepository.save(turno);
        return ResponseEntity.ok(updated);
    }

    private void vincularSegmentos(TurnoPlantilla turno) {
        if (turno.getSegmentos() != null) {
            turno.getSegmentos().forEach(s -> s.setTurnoPlantilla(turno));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!turnoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        turnoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
