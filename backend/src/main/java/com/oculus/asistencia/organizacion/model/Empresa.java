package com.oculus.asistencia.organizacion.model;

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
@ToString(exclude = {"sedes", "dispositivos", "empleados", "usuarios", "marcaciones", "intentos", "perfilesBiometricos"})
@EqualsAndHashCode(exclude = {"sedes", "dispositivos", "empleados", "usuarios", "marcaciones", "intentos", "perfilesBiometricos"})
@Entity
@Table(name = "empresa")
public class Empresa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(name = "identificacion_fiscal", unique = true)
    private String identificacionFiscal;

    private String direccion;

    private String telefono;

    @Column(nullable = false)
    @Builder.Default
    private boolean activo = true;

    @Column(name = "cierre_dia_automatico")
    @Builder.Default
    private boolean cierreDiaAutomatico = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "empresa", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    @Builder.Default
    private java.util.List<Sede> sedes = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "empresa", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    @Builder.Default
    private java.util.List<Dispositivo> dispositivos = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "empresa", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    @Builder.Default
    private java.util.List<com.oculus.asistencia.rrhh.model.Empleado> empleados = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "empresa", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    @Builder.Default
    private java.util.List<com.oculus.asistencia.identidad.model.Usuario> usuarios = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "empresa", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    @Builder.Default
    private java.util.List<com.oculus.asistencia.marcas.model.MarcacionEvento> marcaciones = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "empresa", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    @Builder.Default
    private java.util.List<com.oculus.asistencia.marcas.model.MarcacionIntento> intentos = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "empresa", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    @Builder.Default
    private java.util.List<com.oculus.asistencia.biometria.model.PerfilBiometrico> perfilesBiometricos = new java.util.ArrayList<>();
}
