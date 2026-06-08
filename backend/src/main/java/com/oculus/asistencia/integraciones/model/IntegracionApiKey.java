package com.oculus.asistencia.integraciones.model;

import com.oculus.asistencia.organizacion.model.Empresa;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "integracion_api_key")
@Getter
@Setter
public class IntegracionApiKey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(name = "api_key_hash", nullable = false)
    private String apiKeyHash;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "activa")
    private boolean activa = true;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
