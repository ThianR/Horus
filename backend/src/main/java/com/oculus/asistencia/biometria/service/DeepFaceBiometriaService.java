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

    @org.springframework.beans.factory.annotation.Value("${oculus.biometria.umbral:0.68}")
    private double umbralDistancia;

    @org.springframework.beans.factory.annotation.Value("${oculus.biometria.modelo:ArcFace}")
    private String modeloBiometrico;

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
                log.error("Dimensión de embeddings no coincide: {} vs {}", embedding1.length, embedding2.length);
                return 0.0;
            }

            // Similitud coseno: más robusta para vectores normalizados L2
            // Para vectores L2-normalizados: cosine_sim = dot(a, b)
            double dotProduct = 0.0;
            double normA = 0.0;
            double normB = 0.0;
            for (int i = 0; i < embedding1.length; i++) {
                dotProduct += embedding1[i] * embedding2[i];
                normA += embedding1[i] * (double) embedding1[i];
                normB += embedding2[i] * (double) embedding2[i];
            }
            normA = Math.sqrt(normA);
            normB = Math.sqrt(normB);

            // Evitar división por cero
            if (normA == 0.0 || normB == 0.0) {
                return 0.0;
            }

            double similitud = dotProduct / (normA * normB);

            // Convertir umbral euclidiano a coseno: cos_sim = 1 - (dist^2 / 2)
            double umbralCoseno = 1.0 - (umbralDistancia * umbralDistancia / 2.0);

            if (similitud >= umbralCoseno) {
                log.info("DeepFace: MATCH POSITIVO -> Modelo: {}, Similitud Coseno: {} (umbral: {})",
                        modeloBiometrico, String.format("%.4f", similitud), String.format("%.4f", umbralCoseno));
            } else {
                log.info("DeepFace: MATCH NEGATIVO -> Modelo: {}, Similitud Coseno: {} (umbral: {})",
                        modeloBiometrico, String.format("%.4f", similitud), String.format("%.4f", umbralCoseno));
            }

            return similitud;

        } catch (Exception e) {
            log.error("Excepción al comparar embeddings", e);
            return 0.0;
        }
    }

    @Override
    public boolean verificarLiveness(byte[] imagenBytes) {
        return true;
    }

    @Override
    public Long identificarEmpleado(float[] objetivo, List<BiometriaService.PerfilCandidato> candidatos) {
        log.info("Buscando identidad en {} candidatos mediante {}...", candidatos.size(), modeloBiometrico);

        Long mejorId = null;
        double maxSim = -1.0;

        for (BiometriaService.PerfilCandidato candidato : candidatos) {
            double sim = compararEmbeddings(objetivo, candidato.embedding());
            if (sim > maxSim) {
                maxSim = sim;
                mejorId = candidato.empleadoId();
            }
        }

        // Usar el mismo umbral coseno derivado del parámetro de distancia
        double umbralCoseno = 1.0 - (umbralDistancia * umbralDistancia / 2.0);

        if (mejorId != null && maxSim >= umbralCoseno) {
            log.info("Empleado identificado: ID={} con similitud coseno {}", mejorId, maxSim);
            return mejorId;
        }

        log.warn("No se encontró coincidencia suficiente. Mejor similitud coseno: {} (umbral: {})", maxSim, umbralCoseno);
        return null;
    }
}
