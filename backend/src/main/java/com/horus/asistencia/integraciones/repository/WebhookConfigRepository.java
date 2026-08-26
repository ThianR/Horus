package com.horus.asistencia.integraciones.repository;

import com.horus.asistencia.integraciones.model.WebhookConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WebhookConfigRepository extends JpaRepository<WebhookConfig, Long> {
    List<WebhookConfig> findByEmpresaIdAndActivoTrue(Long empresaId);
}
