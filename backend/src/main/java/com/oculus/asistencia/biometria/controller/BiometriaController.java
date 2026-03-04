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

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Optional;

@RestController
@RequestMapping("/api/biometria")
@RequiredArgsConstructor
@Slf4j
public class BiometriaController {

    private final PerfilBiometricoRepository perfilRepository;
    private final EmpleadoRepository empleadoRepository;
    private final BiometriaService biometriaService;

    @PostMapping("/registrar/{empleadoId}")
    public ResponseEntity<?> registrarRostro(
            @PathVariable Long empleadoId,
            @RequestParam("foto") MultipartFile foto) {

        try {
            log.info("Registrando rostro para empleado ID: {}", empleadoId);
            Optional<Empleado> empleadoOpt = empleadoRepository.findById(empleadoId);
            if (empleadoOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Empleado no encontrado");
            }

            byte[] bytes = foto.getBytes();
            float[] embedding = biometriaService.extraerEmbedding(bytes);

            // Convertir float[] a byte[] para guardar en DB
            byte[] embeddingBytes = floatsToBytes(embedding);

            PerfilBiometrico perfil = perfilRepository.findByEmpleadoId(empleadoId)
                    .orElse(new PerfilBiometrico());

            perfil.setEmpleado(empleadoOpt.get());
            perfil.setEmbedding(embeddingBytes);
            perfil.setActivo(true);
            perfil.setVersion(perfil.getVersion() + 1);

            perfilRepository.save(perfil);

            return ResponseEntity.ok("Rostro registrado exitosamente");

        } catch (Exception e) {
            log.error("Error al registrar rostro", e);
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{empleadoId}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> eliminarRostro(@PathVariable Long empleadoId) {
        try {
            log.info("Eliminando perfil biométrico para empleado ID: {}", empleadoId);
            perfilRepository.deleteByEmpleadoId(empleadoId);
            return ResponseEntity.ok("Registro biométrico eliminado correctamente");
        } catch (Exception e) {
            log.error("Error al eliminar perfil biométrico", e);
            return ResponseEntity.internalServerError().body("Error al eliminar: " + e.getMessage());
        }
    }

    private byte[] floatsToBytes(float[] floats) {
        ByteBuffer buffer = ByteBuffer.allocate(floats.length * 4);
        buffer.order(ByteOrder.LITTLE_ENDIAN);
        for (float f : floats) {
            buffer.putFloat(f);
        }
        return buffer.array();
    }
}
