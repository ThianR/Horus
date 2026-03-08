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
        log.info("Extraer embedding determinista para prueba ({} bytes)", imagenBytes.length);

        // Usamos CRC32 para generar una semilla basada en el contenido real
        // esto evita que imágenes de igual tamaño tengan el mismo embedding
        java.util.zip.CRC32 crc = new java.util.zip.CRC32();
        crc.update(imagenBytes);
        long seed = crc.getValue();

        Random deterministicRandom = new Random(seed);

        float[] embedding = new float[128];
        for (int i = 0; i < 128; i++) {
            embedding[i] = deterministicRandom.nextFloat();
        }
        return embedding;
    }

    @Override
    public double compararEmbeddings(float[] embedding1, float[] embedding2) {
        // Simulación: Distancia Coseno o Euclidiana inversa.
        // Con semillas aleatorias, la probabilidad de coincidencia alta es baja.
        double diff = 0;
        for (int i = 0; i < embedding1.length; i++) {
            diff += Math.pow(embedding1[i] - embedding2[i], 2);
        }
        double distancia = Math.sqrt(diff);
        // Normalizamos a una "similitud" (1.0 = idénticos, 0.0 = muy diferentes)
        // En un mock aleatorio de 128 dims, la distancia media es alta.
        double similitud = 1.0 / (1.0 + distancia);
        return similitud;
    }

    @Override
    public boolean verificarLiveness(byte[] imagenBytes) {
        log.info("Verificando liveness simulado...");
        // 95% de probabilidad de éxito en el mock
        return random.nextDouble() > 0.05;
    }

    @Override
    public ResultadoValidacion validarCalidadImagen(byte[] imagenBytes) {
        log.info("Validando calidad de imagen (Simulado)...");

        // Simulamos chequeos de calidad
        if (imagenBytes.length < 5000) {
            return new ResultadoValidacion(false, 0.2, "Imagen demasiado pequeña o borrosa");
        }

        // Calidad aleatoria entre 0.7 y 1.0 para el mock
        double calidad = 0.7 + (random.nextDouble() * 0.3);

        return new ResultadoValidacion(true, calidad, "Calidad óptima detectada");
    }

    @Override
    public Long identificarEmpleado(float[] objetivo, List<PerfilCandidato> candidatos) {
        log.info("Buscando identidad en {} candidatos...", candidatos.size());

        Long mejorId = null;
        double maxSim = -1.0;

        for (PerfilCandidato candidato : candidatos) {
            double sim = compararEmbeddings(objetivo, candidato.embedding());
            if (sim > maxSim) {
                maxSim = sim;
                mejorId = candidato.empleadoId();
            }
        }

        // UMBRAL DE SEGURIDAD: Aumentado de 0.1 a 0.85 para evitar falsos positivos
        // Nota: Con embeddings aleatorios del mock, es difícil llegar a 0.85
        // a menos que la imagen sea la misma (mismo CRC32).
        double UMBRAL_STRICT = 0.85;

        if (mejorId != null && maxSim > UMBRAL_STRICT) {
            log.info("Empleado identificado: ID={} con similitud {}", mejorId, maxSim);
            return mejorId;
        }

        log.warn("No se encontró coincidencia suficiente. Mejor similitud: {}", maxSim);
        return null;
    }
}
