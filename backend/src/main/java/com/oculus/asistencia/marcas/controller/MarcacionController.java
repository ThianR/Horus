package com.oculus.asistencia.marcas.controller;

import com.oculus.asistencia.marcas.model.MarcacionEvento;
import com.oculus.asistencia.marcas.repository.MarcacionEventoRepository;
import com.oculus.asistencia.motor.service.MotorAsistenciaService;
import com.oculus.asistencia.rrhh.model.Empleado;
import com.oculus.asistencia.rrhh.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/marcaciones")
@RequiredArgsConstructor
@Slf4j
public class MarcacionController {

    private final MarcacionEventoRepository marcacionRepository;
    private final EmpleadoRepository empleadoRepository;
    private final MotorAsistenciaService motorService;
    private final com.oculus.asistencia.biometria.service.BiometriaService biometriaService;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarMarcacion(@RequestBody MarcacionDto dto) {
        log.info("Recibida marcacion: {}", dto);

        // Idempotencia
        if (marcacionRepository.existsById(dto.uuid())) {
            return ResponseEntity.ok("Evento duplicado ignorado");
        }

        // Validación de Liveness (Simulado)
        if ("FACIAL".equals(dto.metodoVerificacion()) && !biometriaService.verificarLiveness(null)) {
            log.warn("Falla de Liveness detectada para empleado: {}", dto.empleadoId());
            return ResponseEntity.badRequest().body("Falla de validación biométrica (Liveness)");
        }

        // Buscar Empleado
        Optional<Empleado> empleadoOpt = empleadoRepository.findById(dto.empleadoId());
        if (empleadoOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Empleado no encontrado");
        }

        MarcacionEvento evento = new MarcacionEvento();
        evento.setUuid(dto.uuid());
        evento.setEmpleado(empleadoOpt.get());
        evento.setTimestampEvento(dto.timestamp());
        evento.setTipoEvento(dto.tipo());
        evento.setMetodoVerificacion(dto.metodoVerificacion() != null ? dto.metodoVerificacion() : "FACIAL");
        evento.setEstadoProceso(MarcacionEvento.EstadoProceso.PENDIENTE);

        // Guardar Evento
        marcacionRepository.save(evento);

        // Procesar Asíncronamente (o síncrono para MVP)
        try {
            motorService.procesarMarcacion(evento);
            evento.setEstadoProceso(MarcacionEvento.EstadoProceso.PROCESADO);
        } catch (Exception e) {
            log.error("Error procesando marcacion", e);
            evento.setEstadoProceso(MarcacionEvento.EstadoProceso.ERROR);
            evento.setErrorMotivo(e.getMessage());
        }
        marcacionRepository.save(evento);

        return ResponseEntity.ok().build();
    }

    // DTO simple interno
    public record MarcacionDto(
            String uuid,
            Long empleadoId,
            LocalDateTime timestamp,
            MarcacionEvento.TipoEvento tipo,
            String metodoVerificacion) {
    }
}
