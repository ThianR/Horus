package com.oculus.asistencia.integraciones.repository;

import com.oculus.asistencia.integraciones.model.IntegracionApiKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IntegracionApiKeyRepository extends JpaRepository<IntegracionApiKey, Long> {
    Optional<IntegracionApiKey> findByApiKeyHashAndActivaTrue(String apiKeyHash);
}
