package com.oculus.asistencia.config;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/logs")
@Slf4j
public class LogController {

    @PostMapping
    public ResponseEntity<Void> receiveLog(@RequestBody LogEntry entry) {
        String message = String.format("[FRONTEND] [%s] %s", entry.getLevel(), entry.getMessage());

        switch (entry.getLevel().toUpperCase()) {
            case "ERROR":
                log.error(message);
                break;
            case "WARN":
                log.warn(message);
                break;
            case "INFO":
            default:
                log.info(message);
                break;
        }
        return ResponseEntity.ok().build();
    }

    @Data
    public static class LogEntry {
        private String level;
        private String message;
    }
}
