package com.oculus.asistencia.rrhh.controller;

import com.oculus.asistencia.identidad.repository.UsuarioRepository;
import com.oculus.asistencia.rrhh.model.Empleado;
import com.oculus.asistencia.rrhh.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empleados")
@RequiredArgsConstructor
public class EmpleadoController {

    private final EmpleadoRepository empleadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final com.oculus.asistencia.rrhh.repository.EmpleadoSedeHabilitadaRepository sedeHabilitadaRepository;
    private final com.oculus.asistencia.turnos.repository.AsignacionTurnoRepository asignacionTurnoRepository;
    private final com.oculus.asistencia.biometria.repository.PerfilBiometricoRepository perfilBiometricoRepository;
    private final com.oculus.asistencia.marcas.repository.MarcacionEventoRepository marcacionEventoRepository;

    @GetMapping
    public ResponseEntity<List<Empleado>> listarTodos() {
        return ResponseEntity.ok(empleadoRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Empleado> obtenerPorId(@PathVariable Long id) {
        return empleadoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Empleado> crear(@RequestBody Empleado empleado) {
        resolverAsociaciones(empleado);
        Empleado saved = empleadoRepository.save(empleado);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Empleado> actualizar(@PathVariable Long id, @RequestBody Empleado empleado) {
        if (!empleadoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        empleado.setId(id);
        resolverAsociaciones(empleado);
        Empleado updated = empleadoRepository.save(empleado);
        return ResponseEntity.ok(updated);
    }

    private void resolverAsociaciones(Empleado empleado) {
        if (empleado.getSupervisorId() != null) {
            empleadoRepository.findById(empleado.getSupervisorId())
                    .ifPresent(empleado::setSupervisor);
        }
        if (empleado.getUsuarioId() != null) {
            usuarioRepository.findById(empleado.getUsuarioId())
                    .ifPresent(empleado::setUsuario);
        }
    }

    @DeleteMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        return empleadoRepository.findById(id)
                .map(empleado -> {
                    // 1. Limpiar subordinados (quitar supervisor)
                    List<Empleado> subordinados = empleadoRepository.findAll().stream()
                            .filter(e -> e.getSupervisor() != null && e.getSupervisor().getId().equals(id))
                            .toList();
                    subordinados.forEach(s -> {
                        s.setSupervisor(null);
                        empleadoRepository.save(s);
                    });

                    // 2. Limpiar dependencias en otras tablas
                    marcacionEventoRepository.deleteByEmpleadoId(id);
                    perfilBiometricoRepository.deleteByEmpleadoId(id);
                    asignacionTurnoRepository.deleteByEmpleadoId(id);
                    sedeHabilitadaRepository.deleteByEmpleado(empleado);

                    // 3. Borrar empleado
                    empleadoRepository.delete(empleado);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
