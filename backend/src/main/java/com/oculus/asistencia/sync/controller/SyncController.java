package com.oculus.asistencia.sync.controller;

import com.oculus.asistencia.marcas.controller.MarcacionController.MarcacionDto;
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
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sincronizacion")
@RequiredArgsConstructor
@Slf4j
public class SyncController {

    private final MarcacionEventoRepository marcacionRepository;
    private final EmpleadoRepository empleadoRepository;
    private final MotorAsistenciaService motorService;
    private final com.oculus.asistencia.biometria.repository.PerfilBiometricoRepository perfilRepository;
    private final com.oculus.asistencia.biometria.service.PaqueteEmbeddingsService paqueteService;
    private final com.oculus.asistencia.organizacion.service.EmpresaService empresaService;

    @PostMapping("/subir-eventos")
    public ResponseEntity<SyncResult> subirEventos(@RequestBody List<MarcacionDto> eventos) {
        log.info("Recibiendo lote de {} eventos offline", eventos.size());
        int procesados = 0;
        int ignorados = 0;
        int error = 0;

        for (MarcacionDto dto : eventos) {
            try {
                if (marcacionRepository.existsById(dto.uuid())) {
                    ignorados++;
                    continue;
                }

                Optional<Empleado> empOpt = empleadoRepository.findById(dto.empleadoId());
                if (empOpt.isPresent()) {
                    MarcacionEvento ev = new MarcacionEvento();
                    ev.setUuid(dto.uuid());
                    ev.setEmpleado(empOpt.get());
                    ev.setTimestampEvento(dto.timestamp());
                    ev.setTipoEvento(dto.tipo());
                    ev.setEmpresa(empresaService.getEmpresaDefault());
                    ev.setEstadoProceso(MarcacionEvento.EstadoProceso.PENDIENTE);
                    ev.setMetodoVerificacion("OFFLINE_SYNC");

                    marcacionRepository.save(ev);

                    // Intentar procesar inmediatamente
                    try {
                        motorService.procesarMarcacion(ev);
                        ev.setEstadoProceso(MarcacionEvento.EstadoProceso.PROCESADO);
                        marcacionRepository.save(ev);
                    } catch (Exception e) {
                        log.warn("Error procesando evento offline {}: {}", ev.getUuid(), e.getMessage());
                    }
                    procesados++;
                } else {
                    error++; // Empleado no encontrado (quizás borrado o ID incorrecto)
                }
            } catch (Exception e) {
                log.error("Error guardando evento offline", e);
                error++;
            }
        }

        return ResponseEntity.ok(new SyncResult(procesados, ignorados, error));
    }

    @GetMapping("/descargar-cambios")
    public ResponseEntity<?> descargarCambios(@RequestParam(required = false) LocalDateTime desde) {
        // MVP: Retorna lista completa de empleados activos del tenant
        List<Empleado> empleados = empleadoRepository.findAllByEmpresaId(empresaService.getEmpresaDefault().getId());
        return ResponseEntity.ok(empleados);
    }

    @GetMapping("/embeddings/sede/{sedeId}")
    public ResponseEntity<?> descargarEmbeddings(@PathVariable Long sedeId,
            @RequestParam(defaultValue = "0") Long version) {

        log.info("Sede {} solicita descarga de embeddings desde versión {}", sedeId, version);

        // En una implementación real, filtraríamos por sede (habilitación)
        // Por ahora retornamos todos los del tenant que tengan versión superior a la local del kiosco
        List<com.oculus.asistencia.biometria.model.PerfilBiometrico> perfiles = perfilRepository.findAllByEmpresaId(empresaService.getEmpresaDefault().getId());

        return ResponseEntity.ok(perfiles.stream()
                .filter(p -> p.getVersion() > version)
                .map(p -> new EmbeddingDto(p.getEmpleado().getId(), p.getEmbedding(), p.getVersion()))
                .toList());
    }

    @GetMapping("/embeddings/paquete/{sedeId}")
    public ResponseEntity<byte[]> descargarPaquete(@PathVariable Long sedeId) {
        log.info("Generando y descargando paquete binario para sede: {}", sedeId);
        byte[] data = paqueteService.generarPaqueteParaSede(sedeId);

        return ResponseEntity.ok()
                .header("Content-Type", "application/octet-stream")
                .header("Content-Disposition", "attachment; filename=\"embeddings_sede_" + sedeId + ".bin\"")
                .body(data);
    }

    public record SyncResult(int procesados, int ignorados, int errores) {
    }

    public record EmbeddingDto(Long empleadoId, byte[] embedding, Long version) {
    }
}
