package com.oculus.asistencia.integraciones.model;

import com.oculus.asistencia.organizacion.model.Empresa;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "webhook_config")
@Getter
@Setter
public class WebhookConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(name = "url", nullable = false)
    private String url;

    @Column(name = "secret_key")
    private String secretKey;

    @Column(name = "activo")
    private boolean activo = true;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
