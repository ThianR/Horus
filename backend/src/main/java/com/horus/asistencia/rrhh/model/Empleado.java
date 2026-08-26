package com.horus.asistencia.rrhh.model;

import com.horus.asistencia.organizacion.model.Empresa;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.horus.asistencia.identidad.model.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"empresa", "usuario", "supervisor", "perfilBiometrico", "marcaciones"})
@EqualsAndHashCode(exclude = {"empresa", "usuario", "supervisor", "perfilBiometrico", "marcaciones"})
@Entity
@Table(name = "empleado", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"codigo_empleado", "empresa_id"})
})
public class Empleado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Empresa empresa;

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

    @Transient
    private String turnoActual;

    @Transient
    private String diasTurnoActual;

    @Transient
    private String sedeActual;

    @Transient
    private String rolSistema;

    @Transient
    private Long sedeId;

    @Transient
    @JsonProperty("biometriaRegistrada")
    private boolean biometriaRegistrada;

    @Column(name = "codigo_empleado", nullable = false)
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
    @OneToOne(mappedBy = "empleado", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private com.horus.asistencia.biometria.model.PerfilBiometrico perfilBiometrico;

    @OneToMany(mappedBy = "empleado", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    @Builder.Default
    private java.util.List<com.horus.asistencia.marcas.model.MarcacionEvento> marcaciones = new java.util.ArrayList<>();
}
