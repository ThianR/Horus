package com.oculus.asistencia.rrhh.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.oculus.asistencia.identidad.model.Usuario;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "empleado")
public class Empleado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "passwordHash" })
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    @JsonIgnoreProperties({ "supervisor", "hibernateLazyInitializer", "handler" })
    private Empleado supervisor;

    @Transient
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Long supervisorId;

    @Transient
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Long usuarioId;

    @Column(name = "codigo_empleado", nullable = false, unique = true)
    private String codigoEmpleado;

    @Column(name = "numero_documento", nullable = false)
    private String numeroDocumento;

    @Column(name = "nombre_completo", nullable = false)
    private String nombreCompleto;

    private String email;

    @Enumerated(EnumType.STRING)
    private EstadoEmpleado estado;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum EstadoEmpleado {
        ACTIVO, INACTIVO, LICENCIA
    }
}
