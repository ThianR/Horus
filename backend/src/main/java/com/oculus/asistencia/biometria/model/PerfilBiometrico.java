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

    @OneToOne(optional = false)
    @JoinColumn(name = "empleado_id")
    private Empleado empleado;

    private Long version = 1L;

    private boolean activo = true;

    @Lob
    private byte[] embedding;

    private String formato = "FLOAT32_128";

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
