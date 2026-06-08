package com.oculus.asistencia.biometria.client;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class BiometriaClient {

    private final RestTemplate restTemplate;

    @Value("${biometria.python.url:http://localhost:8001}")
    private String pythonServiceUrl;

    @Data
    public static class ExtractResponse {
        private List<Float> embedding;
        private Double face_confidence;
        private Map<String, Object> bbox;
    }

    public ExtractResponse extraerCaracteristicas(byte[] imageBytes, String filename) {
        log.info("Enviando imagen a servicio Python para extracción...");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(imageBytes) {
            @Override
            public String getFilename() {
                return filename;
            }
        });

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<ExtractResponse> response = restTemplate.postForEntity(
                    pythonServiceUrl + "/api/v1/extract",
                    requestEntity,
                    ExtractResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                log.error("Error del servicio Python: Código esperado 2xx, recibido {}", response.getStatusCode());
                throw new RuntimeException("Error en el servicio biométrico (Extracción)");
            }
        } catch (Exception e) {
            log.error("Excepción al comunicarse con el servicio Python de Biometría: {}", e.getMessage());
            throw new RuntimeException(
                    "Fallo en la conexión biométrica. Asegúrese de que DeepFace esté corriendo en " + pythonServiceUrl,
                    e);
        }
    }

    public Map<String, Object> checkHealth() {
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    pythonServiceUrl + "/health",
                    org.springframework.http.HttpMethod.GET,
                    null,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});
            return response.getBody();
        } catch (Exception e) {
            log.warn("El servicio de biometría Python no responde en {}: {}", pythonServiceUrl, e.getMessage());
            return Map.of("status", "error", "message", e.getMessage());
        }
    }
}
