package com.oculus.asistencia.integraciones.service;

import com.oculus.asistencia.integraciones.model.WebhookConfig;
import com.oculus.asistencia.integraciones.repository.WebhookConfigRepository;
import com.oculus.asistencia.marcas.model.MarcacionEvento;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebhookDispatcherService {

    private final WebhookConfigRepository webhookConfigRepository;
    private final RestTemplate restTemplate = new RestTemplate(); // En producción, es mejor usar un RestTemplate builder configurado

    @Async
    public void dispatchMarcacion(MarcacionEvento evento) {
        if (evento.getEmpresa() == null) return;
        
        List<WebhookConfig> configs = webhookConfigRepository.findByEmpresaIdAndActivoTrue(evento.getEmpresa().getId());
        if (configs.isEmpty()) {
            return;
        }

        IntegracionService.MarcacionDto payload = new IntegracionService.MarcacionDto(
                evento.getUuid(),
                evento.getEmpleado().getNumeroDocumento(),
                evento.getEmpleado().getNombreCompleto(),
                evento.getTimestampEvento(),
                evento.getTipoEvento().name(),
                evento.getSede() != null ? evento.getSede().getNombre() : "Desconocida",
                evento.getEstadoProceso().name()
        );

        for (WebhookConfig config : configs) {
            try {
                log.info("Despachando webhook para empresa {} a URL {}", evento.getEmpresa().getId(), config.getUrl());
                // Por simplicidad, se envia POST sin firma. En el futuro usar config.getSecretKey() para firmar (ej. HMAC).
                restTemplate.postForEntity(config.getUrl(), payload, String.class);
            } catch (Exception e) {
                log.warn("Fallo al despachar webhook a {}: {}", config.getUrl(), e.getMessage());
            }
        }
    }
}
