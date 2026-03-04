package com.oculus.asistencia.rrhh.controller;

import com.oculus.asistencia.identidad.repository.UsuarioRepository;
import com.oculus.asistencia.rrhh.model.Empleado;
import com.oculus.asistencia.rrhh.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.oculus.asistencia.rrhh.dto.AsignacionMasivaDto;
import com.oculus.asistencia.turnos.model.AsignacionTurno;
import com.oculus.asistencia.turnos.model.TurnoPlantilla;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api/empleados")
@RequiredArgsConstructor
public class EmpleadoController {

    private final EmpleadoRepository empleadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final com.oculus.asistencia.rrhh.repository.EmpleadoSedeHabilitadaRepository sedeHabilitadaRepository;
    private final com.oculus.asistencia.turnos.repository.AsignacionTurnoRepository asignacionTurnoRepository;
    private final com.oculus.asistencia.turnos.repository.TurnoPlantillaRepository turnoPlantillaRepository;
    private final com.oculus.asistencia.biometria.repository.PerfilBiometricoRepository perfilBiometricoRepository;
    private final com.oculus.asistencia.marcas.repository.MarcacionEventoRepository marcacionEventoRepository;

    @GetMapping
    public ResponseEntity<List<Empleado>> listarTodos() {
        List<Empleado> empleados = empleadoRepository.findAll();
        java.time.LocalDate hoy = java.time.LocalDate.now();

        List<com.oculus.asistencia.turnos.model.AsignacionTurno> asignaciones = asignacionTurnoRepository.findAll()
                .stream()
                .filter(a -> !a.getFechaInicio().isAfter(hoy)
                        && (a.getFechaFin() == null || !a.getFechaFin().isBefore(hoy)))
                .toList();

        List<com.oculus.asistencia.rrhh.model.EmpleadoSedeHabilitada> sedesHabilitadas = sedeHabilitadaRepository
                .findAll().stream()
                .filter(com.oculus.asistencia.rrhh.model.EmpleadoSedeHabilitada::isActivo)
                .toList();

        List<com.oculus.asistencia.biometria.model.PerfilBiometrico> perfiles = perfilBiometricoRepository.findAll();
        java.util.Set<Long> empleadosConBiometria = perfiles.stream()
                .filter(p -> p.isActivo() && p.getEmbedding() != null)
                .map(p -> p.getEmpleado().getId())
                .collect(java.util.stream.Collectors.toSet());

        System.out.println("DEBUG: IDs con biometría encontrados: " + empleadosConBiometria);

        for (Empleado emp : empleados) {
            emp.setBiometriaRegistrada(empleadosConBiometria.contains(emp.getId()));

            boolean tieneAsignacion = false;
            for (com.oculus.asistencia.turnos.model.AsignacionTurno a : asignaciones) {
                if (a.getEmpleado().getId().equals(emp.getId())) {
                    emp.setTurnoActual(a.getTurnoPlantilla().getNombre());
                    emp.setDiasTurnoActual(a.getDiasSemana());
                    tieneAsignacion = true;
                    break;
                }
            }
            if (!tieneAsignacion) {
                sedesHabilitadas.stream()
                        .filter(sh -> sh.getEmpleado().getId().equals(emp.getId()))
                        .findFirst()
                        .ifPresent(sh -> {
                            if (sh.getSede() != null && sh.getSede().getTurnoDefecto() != null) {
                                emp.setTurnoActual(sh.getSede().getTurnoDefecto().getNombre() + " (Sede)");
                                emp.setDiasTurnoActual(sh.getSede().getDiasTurnoDefecto());
                            }
                        });
            }
        }
        return ResponseEntity.ok(empleados);
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

    @PostMapping("/asignacion-masiva")
    @Transactional
    public ResponseEntity<Void> asignarHorarioMasivo(@RequestBody AsignacionMasivaDto dto) {
        TurnoPlantilla turno = turnoPlantillaRepository.findById(dto.getTurnoId())
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        for (Long empId : dto.getEmpleadoIds()) {
            Empleado empleado = empleadoRepository.findById(empId)
                    .orElseThrow(() -> new RuntimeException("Empleado no encontrado: " + empId));

            // Cerramos asignaciones vigentes desde la fecha de inicio menos un dia
            List<AsignacionTurno> asignaciones = asignacionTurnoRepository.findAll().stream()
                    .filter(a -> a.getEmpleado().getId().equals(empId))
                    .filter(a -> a.getFechaFin() == null || a.getFechaFin().isAfter(dto.getFechaInicio().minusDays(1)))
                    .toList();

            for (AsignacionTurno asignacion : asignaciones) {
                asignacion.setFechaFin(dto.getFechaInicio().minusDays(1));
                asignacionTurnoRepository.save(asignacion);
            }

            // Creamos la nueva asignación
            AsignacionTurno nuevaAsignacion = new AsignacionTurno();
            nuevaAsignacion.setEmpleado(empleado);
            nuevaAsignacion.setTurnoPlantilla(turno);
            nuevaAsignacion.setFechaInicio(dto.getFechaInicio());
            nuevaAsignacion.setDiasSemana(dto.getDiasSemana());

            asignacionTurnoRepository.save(nuevaAsignacion);
        }

        return ResponseEntity.ok().build();
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
