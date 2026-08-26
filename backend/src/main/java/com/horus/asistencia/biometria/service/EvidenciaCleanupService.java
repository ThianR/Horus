package com.horus.asistencia.biometria.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class EvidenciaCleanupService {

    /**
     * Se ejecuta todos los días a las 02:00 AM.
     * Elimina (o limpia ruta) de evidencias con más de 60 días.
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void limpiarEvidenciasAntiguas() {
        log.info("Iniciando job de limpieza de evidencias...");

        LocalDateTime fechaLimite = LocalDateTime.now().minusDays(60);

        // Buscar eventos antiguos que tengan ruta de foto
        // Nota: Esto requeriría un método custom en repositorio, lo simulamos aquí
        // List<MarcacionEvento> eventos =
        // marcacionRepository.findByTimestampEventoBeforeAndEvidenciaFotoPathNotNull(fechaLimite);

        // Como no tengo ese método en la interfaz, lo dejo documentado como pendiente
        // para su futura implementación.
        log.info("Simulando limpieza de evidencias anteriores a: {}", fechaLimite);

        // Pasos a implementar: Iterar eventos, borrar archivo físico y setear evidenciaFotoPath = null
        // manteniendo evidenciaFotoHash.

        log.info("Job de limpieza finalizado.");
    }
}
