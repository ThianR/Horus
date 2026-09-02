package com.horus.asistencia.biometria.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "muestra_biometrica")
public class MuestraBiometrica {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "perfil_biometrico_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "muestras" })
    private PerfilBiometrico perfil;

    @Column(nullable = false)
    private byte[] embedding;

    @Column(length = 50)
    private String etiqueta; // Ej: "Frontal", "Perfil Izquierdo"

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
