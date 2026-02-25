package com.oculus.asistencia.biometria.controller;

import com.oculus.asistencia.biometria.model.PerfilBiometrico;
import com.oculus.asistencia.biometria.repository.PerfilBiometricoRepository;
import com.oculus.asistencia.biometria.service.BiometriaService;
import com.oculus.asistencia.rrhh.model.Empleado;
import com.oculus.asistencia.rrhh.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/api/biometria")
@RequiredArgsConstructor
@Slf4j
public class EnrolamientoController {

    private final EmpleadoRepository empleadoRepository;
    private final PerfilBiometricoRepository perfilRepository;
    private final BiometriaService biometriaService;

    @PostMapping("/enrolar/{empleadoId}")
    public ResponseEntity<?> enrolarEmpleado(@PathVariable Long empleadoId, @RequestParam("foto") MultipartFile foto) {
        log.info("Iniciando enrolamiento para empleado ID: {}", empleadoId);

        Optional<Empleado> empOpt = empleadoRepository.findById(empleadoId);
        if (empOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            byte[] bytes = foto.getBytes();

            // 1. Extraer embedding
            float[] embedding = biometriaService.extraerEmbedding(bytes);

            // 2. Guardar o actualizar perfil
            PerfilBiometrico perfil = perfilRepository.findByEmpleadoId(empleadoId)
                    .orElse(new PerfilBiometrico());

            perfil.setEmpleado(empOpt.get());
            perfil.setEmbedding(convertirABytes(embedding));

            perfilRepository.save(perfil);

            return ResponseEntity.ok("Enrolamiento exitoso para: " + empOpt.get().getNombreCompleto());

        } catch (IOException e) {
            log.error("Error al procesar la foto de enrolamiento", e);
            return ResponseEntity.internalServerError().body("Error al procesar la imagen");
        }
    }

    private byte[] convertirABytes(float[] input) {
        java.nio.ByteBuffer buffer = java.nio.ByteBuffer.allocate(input.length * 4);
        for (float f : input) {
            buffer.putFloat(f);
        }
        return buffer.array();
    }
}
