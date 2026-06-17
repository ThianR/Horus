package com.oculus.asistencia.biometria.model;

import com.oculus.asistencia.rrhh.model.Empleado;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "perfil_biometrico")
public class PerfilBiometrico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private com.oculus.asistencia.organizacion.model.Empresa empresa;

    @OneToOne(optional = false)
    @JoinColumn(name = "empleado_id")
    private Empleado empleado;

    private Long version = 1L;

    private boolean activo = true;

    private String formato = "FLOAT32_128";

    @OneToMany(mappedBy = "perfil", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("perfil")
    private java.util.List<MuestraBiometrica> muestras = new java.util.ArrayList<>();

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
