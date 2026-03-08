package com.oculus.asistencia.marcas.controller;

import com.oculus.asistencia.biometria.service.BiometriaService;
import com.oculus.asistencia.marcas.model.MarcacionEvento;
import com.oculus.asistencia.marcas.repository.MarcacionEventoRepository;
import com.oculus.asistencia.motor.service.MotorAsistenciaService;
import com.oculus.asistencia.rrhh.model.Empleado;
import com.oculus.asistencia.rrhh.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/marcaciones")
@RequiredArgsConstructor
@Slf4j
public class MarcacionController {

    private final MarcacionEventoRepository marcacionRepository;
    private final com.oculus.asistencia.marcas.repository.MarcacionIntentoRepository intentoRepository;
    private final EmpleadoRepository empleadoRepository;
    private final MotorAsistenciaService motorService;
    private final com.oculus.asistencia.biometria.repository.PerfilBiometricoRepository perfilRepository;
    private final com.oculus.asistencia.biometria.service.BiometriaService biometriaService;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarMarcacion(@RequestBody MarcacionDto dto) {
        // ... (código existente)
        return procesarRegistro(dto);
    }

    @PostMapping("/identificar")
    public ResponseEntity<?> identificarYRegistrar(
            @RequestParam("foto") MultipartFile foto,
            @RequestParam(value = "tipo", defaultValue = "ENTRADA") MarcacionEvento.TipoEvento tipo) {

        try {
            byte[] bytes = foto.getBytes();

            // 0. Validar Calidad (Opcional para identificación, pero útil para log)
            BiometriaService.ResultadoValidacion checkCalidad = biometriaService.validarCalidadImagen(bytes);
            log.info("Calidad de imagen para identificación: {} (Valida: {})", checkCalidad.calidad(),
                    checkCalidad.esValida());

            // 1. Extraer características
            float[] embedding = biometriaService.extraerEmbedding(bytes);

            // 2. Buscar en base de datos (obtener todos los perfiles activos)
            List<com.oculus.asistencia.biometria.service.BiometriaService.PerfilCandidato> candidatos = obtenerCandidatosReales();
            log.info("Identificando entre {} perfiles biométricos cargados desde DB", candidatos.size());

            // 3. Identificar
            Long empleadoId = biometriaService.identificarEmpleado(embedding, candidatos);
            log.info("Resultado de identificación: {}", empleadoId != null ? "ID " + empleadoId : "NO IDENTIFICADO");

            if (empleadoId == null) {
                return ResponseEntity.status(404)
                        .body("Rostro no reconocido. Por favor, asegúrate de haber registrado tu perfil biométrico.");
            }

            // 4. Registrar marcación formalmente
            MarcacionDto dto = new MarcacionDto(
                    UUID.randomUUID().toString(),
                    empleadoId,
                    LocalDateTime.now(),
                    tipo,
                    "FACIAL");

            return procesarRegistro(dto);

        } catch (Exception e) {
            log.error("Error en identificación biométrica", e);
            return ResponseEntity.internalServerError().body("Error al procesar la imagen: " + e.getMessage());
        }
    }

    private ResponseEntity<?> procesarRegistro(MarcacionDto dto) {
        log.info("Procesando registro de marcacion: {}", dto);

        // Registro de Auditoría Inicial
        com.oculus.asistencia.marcas.model.MarcacionIntento intento = new com.oculus.asistencia.marcas.model.MarcacionIntento();
        intento.setUuid(dto.uuid());
        intento.setEmpleadoIdRaw(dto.empleadoId());
        intento.setTimestampCliente(dto.timestamp());
        intento.setTipoEvento(dto.tipo() != null ? dto.tipo().name() : null);
        intento.setMetodoVerificacion(dto.metodoVerificacion());
        intento.setPayloadOriginal(dto.toString());
        intento.setExito(false);
        intentoRepository.save(intento);

        if (marcacionRepository.existsById(dto.uuid())) {
            intento.setExito(true);
            intento.setErrorMotivo("Evento duplicado ignorado");
            intentoRepository.save(intento);
            return ResponseEntity.ok("Evento duplicado ignorado");
        }

        Optional<Empleado> empleadoOpt = empleadoRepository.findById(dto.empleadoId());
        if (empleadoOpt.isEmpty()) {
            intento.setErrorMotivo("Empleado no encontrado");
            intentoRepository.save(intento);
            return ResponseEntity.badRequest().body("Empleado no encontrado");
        }

        Empleado empleado = empleadoOpt.get();

        MarcacionEvento evento = new MarcacionEvento();
        evento.setUuid(dto.uuid());
        evento.setEmpleado(empleado);
        evento.setTimestampEvento(dto.timestamp());
        evento.setTipoEvento(dto.tipo());
        evento.setMetodoVerificacion(dto.metodoVerificacion() != null ? dto.metodoVerificacion() : "FACIAL");
        evento.setEstadoProceso(MarcacionEvento.EstadoProceso.PENDIENTE);

        marcacionRepository.save(evento);

        try {
            motorService.procesarMarcacion(evento);
            evento.setEstadoProceso(MarcacionEvento.EstadoProceso.PROCESADO);
            intento.setExito(true);
            marcacionRepository.save(evento);
            intentoRepository.save(intento);

            // Retornar información del empleado para el Kiosco
            return ResponseEntity.ok(new MarcacionRespuesta(
                    empleado.getNombreCompleto(),
                    dto.timestamp(),
                    dto.tipo().name()));
        } catch (Exception e) {
            log.error("Error procesando marcacion", e);
            evento.setEstadoProceso(MarcacionEvento.EstadoProceso.ERROR);
            evento.setErrorMotivo(e.getMessage());
            intento.setErrorMotivo(e.getMessage());
            marcacionRepository.save(evento);
            intentoRepository.save(intento);
            return ResponseEntity.internalServerError().body("Error en motor: " + e.getMessage());
        }
    }

    private List<com.oculus.asistencia.biometria.service.BiometriaService.PerfilCandidato> obtenerCandidatosReales() {
        return perfilRepository.findAll().stream()
                .filter(p -> p.isActivo() && p.getEmbedding() != null)
                .map(p -> {
                    float[] emb = bytesToFloats(p.getEmbedding());
                    if (emb.length > 5) {
                        log.info("Candidato ID {}: Dim={}, Primeros 5: [{}, {}, {}, {}, {}]",
                                p.getEmpleado().getId(), emb.length, emb[0], emb[1], emb[2], emb[3], emb[4]);
                    }
                    return new com.oculus.asistencia.biometria.service.BiometriaService.PerfilCandidato(
                            p.getEmpleado().getId(),
                            emb);
                })
                .toList();
    }

    private float[] bytesToFloats(byte[] bytes) {
        if (bytes == null || bytes.length % 4 != 0)
            return new float[0];
        float[] floats = new float[bytes.length / 4];
        java.nio.ByteBuffer.wrap(bytes).order(java.nio.ByteOrder.LITTLE_ENDIAN).asFloatBuffer().get(floats);
        return floats;
    }

    public record MarcacionRespuesta(String nombreEmpleado, LocalDateTime fecha, String tipo) {
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
