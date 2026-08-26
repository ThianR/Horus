package com.horus.asistencia.biometria.controller;

import com.horus.asistencia.biometria.model.PerfilBiometrico;
import com.horus.asistencia.biometria.repository.PerfilBiometricoRepository;
import com.horus.asistencia.biometria.service.BiometriaService;
import com.horus.asistencia.rrhh.model.Empleado;
import com.horus.asistencia.rrhh.repository.EmpleadoRepository;
import com.horus.asistencia.biometria.client.BiometriaClient;
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
    private final BiometriaClient biometriaClient;
    private final com.horus.asistencia.organizacion.service.EmpresaService empresaService;

    @GetMapping("/health")
    public ResponseEntity<?> checkHealth() {
        return ResponseEntity.ok(biometriaClient.checkHealth());
    }

    @PostMapping("/registrar/{empleadoId}")
    public ResponseEntity<?> registrarRostro(
            @PathVariable Long empleadoId,
            @RequestParam("fotos") MultipartFile[] fotos) {

        try {
            log.info("Registrando rostro para empleado ID: {}", empleadoId);
            if (fotos == null || fotos.length < 3) {
                return ResponseEntity.badRequest().body("Se requieren al menos 3 fotos para el registro.");
            }

            Optional<Empleado> empleadoOpt = empleadoRepository.findById(empleadoId);
            if (empleadoOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Empleado no encontrado");
            }

            PerfilBiometrico perfil = perfilRepository.findByEmpleadoId(empleadoId)
                    .orElse(new PerfilBiometrico());

            perfil.setEmpleado(empleadoOpt.get());
            perfil.setEmpresa(empresaService.getEmpresaDefault());
            perfil.setActivo(true);
            perfil.setVersion(perfil.getVersion() + 1);
            
            // Limpiar muestras anteriores si estamos re-registrando
            perfil.getMuestras().clear();

            String[] etiquetas = {"Frontal", "Lado Izquierdo", "Lado Derecho", "Extra 1", "Extra 2", "Extra 3", "Extra 4"};

            for (int i = 0; i < fotos.length; i++) {
                MultipartFile foto = fotos[i];
                byte[] bytes = foto.getBytes();
                float[] embedding = biometriaService.extraerEmbedding(bytes);
                byte[] embeddingBytes = floatsToBytes(embedding);

                com.horus.asistencia.biometria.model.MuestraBiometrica muestra = new com.horus.asistencia.biometria.model.MuestraBiometrica();
                muestra.setPerfil(perfil);
                muestra.setEmbedding(embeddingBytes);
                muestra.setEtiqueta(i < etiquetas.length ? etiquetas[i] : "Muestra " + (i + 1));
                
                perfil.getMuestras().add(muestra);
            }

            perfilRepository.save(perfil);

            return ResponseEntity.ok("Rostro registrado exitosamente con " + fotos.length + " muestras.");

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
