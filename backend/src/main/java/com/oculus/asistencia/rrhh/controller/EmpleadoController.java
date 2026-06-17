package com.oculus.asistencia.rrhh.controller;

import com.oculus.asistencia.identidad.repository.UsuarioRepository;
import com.oculus.asistencia.rrhh.model.Empleado;
import com.oculus.asistencia.rrhh.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.oculus.asistencia.rrhh.repository.EmpleadoSedeHabilitadaRepository sedeHabilitadaRepository;
    private final com.oculus.asistencia.reportes.service.ImportacionMasivaService importacionMasivaService;
    private final com.oculus.asistencia.organizacion.service.EmpresaService empresaService;
    private final com.oculus.asistencia.turnos.repository.AsignacionTurnoRepository asignacionTurnoRepository;
    private final com.oculus.asistencia.turnos.repository.TurnoPlantillaRepository turnoPlantillaRepository;
    private final com.oculus.asistencia.biometria.repository.PerfilBiometricoRepository perfilBiometricoRepository;
    private final com.oculus.asistencia.marcas.repository.MarcacionEventoRepository marcacionEventoRepository;
    private final com.oculus.asistencia.organizacion.repository.SedeRepository sedeRepository;

    @GetMapping
    public ResponseEntity<List<Empleado>> listarTodos() {
        List<Empleado> empleados = empleadoRepository.findAllByEmpresaId(empresaService.getEmpresaDefault().getId());
        java.time.LocalDate hoy = java.time.LocalDate.now();

        List<com.oculus.asistencia.turnos.model.AsignacionTurno> asignaciones = asignacionTurnoRepository.findAllByEmpresaId(empresaService.getEmpresaDefault().getId())
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
                .filter(p -> p.isActivo() && !p.getMuestras().isEmpty())
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
                            emp.setSedeActual(sh.getSede() != null ? sh.getSede().getNombre() : null);
                            emp.setSedeId(sh.getSede() != null ? sh.getSede().getId() : null);
                            if (sh.getSede() != null && sh.getSede().getTurnoDefecto() != null) {
                                emp.setTurnoActual(sh.getSede().getTurnoDefecto().getNombre() + " (Sede)");
                                emp.setDiasTurnoActual(sh.getSede().getDiasTurnoDefecto());
                            }
                        });
            } else {
                sedesHabilitadas.stream()
                        .filter(sh -> sh.getEmpleado().getId().equals(emp.getId()))
                        .findFirst()
                        .ifPresent(sh -> {
                            emp.setSedeActual(sh.getSede() != null ? sh.getSede().getNombre() : null);
                            emp.setSedeId(sh.getSede() != null ? sh.getSede().getId() : null);
                        });
            }
            // Mapear el rol del sistema si tiene usuario
            if (emp.getUsuario() != null) {
                emp.setRolSistema(emp.getUsuario().getRol().name());
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
    @Transactional
    public ResponseEntity<?> crear(@RequestBody Empleado empleado) {
        if (empleado.getEstado() == Empleado.EstadoEmpleado.ACTIVO) {
            java.util.Optional<Empleado> existente = empleadoRepository.findByNumeroDocumentoAndEstado(empleado.getNumeroDocumento(), Empleado.EstadoEmpleado.ACTIVO);
            if (existente.isPresent()) {
                return ResponseEntity.badRequest().body("El documento ya se encuentra activo en el sistema. Debe desactivarlo primero.");
            }
        }
        
        // Crear Usuario Automáticamente
        String username = empleado.getNumeroDocumento();
        if (usuarioRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body("Ya existe un usuario de sistema con ese documento.");
        }
        
        com.oculus.asistencia.identidad.model.Usuario nuevoUsuario = new com.oculus.asistencia.identidad.model.Usuario();
        nuevoUsuario.setEmpresa(empresaService.getEmpresaDefault());
        nuevoUsuario.setUsername(username);
        nuevoUsuario.setPasswordHash(passwordEncoder.encode(username)); // Clave inicial: DNI
        
        String rolReq = empleado.getRolSistema();
        if (rolReq == null || rolReq.isEmpty()) {
            rolReq = "EMPLEADO";
        }
        try {
            nuevoUsuario.setRol(com.oculus.asistencia.identidad.model.Usuario.Rol.valueOf(rolReq));
        } catch (IllegalArgumentException e) {
            nuevoUsuario.setRol(com.oculus.asistencia.identidad.model.Usuario.Rol.EMPLEADO);
        }
        nuevoUsuario.setActivo(true);
        nuevoUsuario.setTourCompletado(false);
        
        usuarioRepository.save(nuevoUsuario);
        empleado.setUsuario(nuevoUsuario);

        resolverAsociaciones(empleado);
        Empleado saved = empleadoRepository.save(empleado);
        gestionarSede(saved, empleado.getSedeId());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Empleado empleado) {
        if (!empleadoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (empleado.getEstado() == Empleado.EstadoEmpleado.ACTIVO) {
            java.util.Optional<Empleado> existente = empleadoRepository.findByNumeroDocumentoAndEstado(empleado.getNumeroDocumento(), Empleado.EstadoEmpleado.ACTIVO);
            if (existente.isPresent() && !existente.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body("El documento ya se encuentra activo en otro empleado del sistema. Debe desactivarlo primero.");
            }
        }
        empleado.setId(id);
        
        // Actualizar rol del usuario si existe
        Empleado empActual = empleadoRepository.findById(id).orElseThrow();
        if (empActual.getUsuario() != null && empleado.getRolSistema() != null) {
            com.oculus.asistencia.identidad.model.Usuario usu = empActual.getUsuario();
            try {
                usu.setRol(com.oculus.asistencia.identidad.model.Usuario.Rol.valueOf(empleado.getRolSistema()));
                usuarioRepository.save(usu);
            } catch (IllegalArgumentException e) {
                // Ignore invalid roles
            }
            empleado.setUsuario(usu);
        }
        
        resolverAsociaciones(empleado);
        Empleado updated = empleadoRepository.save(empleado);
        gestionarSede(updated, empleado.getSedeId());
        return ResponseEntity.ok(updated);
    }
    
    private void gestionarSede(Empleado empleado, Long sedeId) {
        if (sedeId != null) {
            java.util.Optional<com.oculus.asistencia.rrhh.model.EmpleadoSedeHabilitada> habilitacionOpt = sedeHabilitadaRepository
                    .findFirstByEmpleadoIdAndActivoTrue(empleado.getId());

            if (habilitacionOpt.isEmpty() || !habilitacionOpt.get().getSede().getId().equals(sedeId)) {
                if (habilitacionOpt.isPresent()) {
                    com.oculus.asistencia.rrhh.model.EmpleadoSedeHabilitada prev = habilitacionOpt.get();
                    prev.setActivo(false);
                    prev.setFechaHasta(java.time.LocalDate.now());
                    sedeHabilitadaRepository.save(prev);
                }
                sedeRepository.findById(sedeId).ifPresent(sede -> {
                    com.oculus.asistencia.rrhh.model.EmpleadoSedeHabilitada nuevaHabilitacion = new com.oculus.asistencia.rrhh.model.EmpleadoSedeHabilitada();
                    nuevaHabilitacion.setEmpleado(empleado);
                    nuevaHabilitacion.setSede(sede);
                    nuevaHabilitacion.setFechaDesde(java.time.LocalDate.now());
                    nuevaHabilitacion.setActivo(true);
                    sedeHabilitadaRepository.save(nuevaHabilitacion);
                });
            }
        }
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

    @PostMapping("/importar")
    public ResponseEntity<com.oculus.asistencia.rrhh.dto.ImportacionResultDto> importarEmpleados(@RequestParam("file") MultipartFile file)
            throws java.io.IOException {
        com.oculus.asistencia.rrhh.dto.ImportacionResultDto result = importacionMasivaService.importarEmpleadosYSedes(file.getInputStream());
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
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
                        return ResponseEntity.noContent().build();
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("mensaje", "No se puede eliminar el empleado por restricciones de integridad en la base de datos."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("mensaje", "Error inesperado al eliminar el empleado."));
        }
    }
}
