package com.oculus.asistencia.biometria.service;

import com.oculus.asistencia.biometria.client.BiometriaClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@Primary
@RequiredArgsConstructor
public class DeepFaceBiometriaService implements BiometriaService {

    private final BiometriaClient biometriaClient;

    // Umbral estricto para ArcFace usando distancia Euclidiana.
    // En ArcFace, la distancia euclidiana < 1.0 suele ser misma persona.
    // 0.6 es un umbral muy conservador y seguro para alta precisión.
    private static final double ARC_FACE_L2_THRESHOLD = 0.68;

    @Override
    public ResultadoValidacion validarCalidadImagen(byte[] imagenBytes) {
        try {
            log.info("DeepFace: Validando calidad de imagen mediante detección...");
            // Usamos extract para forzar la detección del rostro.
            BiometriaClient.ExtractResponse response = biometriaClient.extraerCaracteristicas(imagenBytes, "check.jpg");

            double confidence = response.getFace_confidence() != null ? response.getFace_confidence() : 1.0;

            int width = ((Number) response.getBbox().get("w")).intValue();
            int height = ((Number) response.getBbox().get("h")).intValue();

            if (width < 60 || height < 60) {
                return new ResultadoValidacion(false, confidence,
                        "El rostro detectado está muy lejos o es muy pequeño.");
            }

            if (confidence < 0.85) {
                return new ResultadoValidacion(false, confidence,
                        "Baja confianza en la detección del rostro. Intente con mejor iluminación.");
            }

            return new ResultadoValidacion(true, confidence, "Calidad óptima");

        } catch (Exception e) {
            log.warn("Error en la validación de calidad de imagen: {}", e.getMessage());
            return new ResultadoValidacion(false, 0.0, e.getMessage());
        }
    }

    @Override
    public float[] extraerEmbedding(byte[] imagenBytes) {
        log.info("DeepFace: Solicitando extracción de características (embedding).");
        BiometriaClient.ExtractResponse response = biometriaClient.extraerCaracteristicas(imagenBytes, "enroll.jpg");

        List<Float> list = response.getEmbedding();
        float[] arr = new float[list.size()];
        for (int i = 0; i < list.size(); i++) {
            arr[i] = list.get(i);
        }
        if (arr.length > 5) {
            log.info("DeepFace: Embedding recibido (Dim={}). Primeros 5: [{}, {}, {}, {}, {}]",
                    arr.length, arr[0], arr[1], arr[2], arr[3], arr[4]);
        }
        return arr;
    }

    @Override
    public double compararEmbeddings(float[] embedding1, float[] embedding2) {
        try {
            if (embedding1.length != embedding2.length) {
                log.error("Dimensión de embeddings no coincide");
                return 0.0; // Distintos
            }

            // 2. Calcular Distancia Euclidiana (L2 Norm)
            double sumSquaredDiff = 0.0;
            for (int i = 0; i < embedding1.length; i++) {
                double diff = embedding1[i] - embedding2[i];
                sumSquaredDiff += diff * diff;
            }
            double distance = Math.sqrt(sumSquaredDiff);

            double similitudCalculada = 1.0 - (distance / (ARC_FACE_L2_THRESHOLD * 2.0));
            similitudCalculada = Math.max(0.0, Math.min(1.0, similitudCalculada));

            if (distance <= ARC_FACE_L2_THRESHOLD) {
                // Forzar similitud alta si pasa la distancia de ArcFace
                similitudCalculada = Math.max(0.86, similitudCalculada);
                log.info("DeepFace: MATCH POSITIVO -> Distancia: {}, Similitud Adaptada: {}", distance,
                        similitudCalculada);
            } else {
                similitudCalculada = Math.min(0.84, similitudCalculada);
                log.info("DeepFace: MATCH NEGATIVO -> Distancia: {}, Similitud Adaptada: {}", distance,
                        similitudCalculada);
            }

            return similitudCalculada;

        } catch (Exception e) {
            log.error("Excepción al comparar embeddings ArcFace", e);
            return 0.0;
        }
    }

    @Override
    public boolean verificarLiveness(byte[] imagenBytes) {
        return true;
    }

    @Override
    public Long identificarEmpleado(float[] objetivo, List<BiometriaService.PerfilCandidato> candidatos) {
        log.info("Buscando identidad en {} candidatos mediante ArcFace...", candidatos.size());

        Long mejorId = null;
        double maxSim = -1.0;

        for (BiometriaService.PerfilCandidato candidato : candidatos) {
            double sim = compararEmbeddings(objetivo, candidato.embedding());
            if (sim > maxSim) {
                maxSim = sim;
                mejorId = candidato.empleadoId();
            }
        }

        double UMBRAL_STRICT = 0.85;

        if (mejorId != null && maxSim > UMBRAL_STRICT) {
            log.info("Empleado identificado por DeepFace: ID={} con similitud {}", mejorId, maxSim);
            return mejorId;
        }

        log.warn("No se encontró coincidencia suficiente en DeepFace. Mejor similitud: {}", maxSim);
        return null;
    }
}
