package com.oculus.asistencia.biometria.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
@Slf4j
public class MockBiometriaService implements BiometriaService {

    private final Random random = new Random();

    @Override
    public float[] extraerEmbedding(byte[] imagenBytes) {
        log.info("Simulando extracción de embedding de imagen ({} bytes)", imagenBytes.length);
        // Simular un vector de 128 dimensiones (común en modelos como FaceNet)
        float[] embedding = new float[128];
        for (int i = 0; i < 128; i++) {
            embedding[i] = random.nextFloat();
        }
        return embedding;
    }

    @Override
    public double compararEmbeddings(float[] embedding1, float[] embedding2) {
        // Simulación: sumamos diferencias absolutas y normalizamos
        double diff = 0;
        for (int i = 0; i < embedding1.length; i++) {
            diff += Math.abs(embedding1[i] - embedding2[i]);
        }
        double similitud = 1.0 - (diff / embedding1.length);
        return Math.max(0, similitud);
    }

    @Override
    public boolean verificarLiveness(byte[] imagenBytes) {
        log.info("Verificando liveness simulado...");
        // 90% de probabilidad de éxito en el mock
        return random.nextDouble() > 0.1;
    }

    @Override
    public Long identificarEmpleado(float[] objetivo, List<PerfilCandidato> candidatos) {
        log.info("Buscando identidad en {} candidatos...", candidatos.size());

        for (PerfilCandidato candidato : candidatos) {
            double sim = compararEmbeddings(objetivo, candidato.embedding());
            if (sim > 0.85) { // Umbral de confianza
                log.info("Empleado identificado: ID={}", candidato.empleadoId());
                return candidato.empleadoId();
            }
        }
        return null;
    }
}
