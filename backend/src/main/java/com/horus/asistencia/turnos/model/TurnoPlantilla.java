package com.horus.asistencia.turnos.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"empresa", "segmentos"})
@EqualsAndHashCode(exclude = {"empresa", "segmentos"})
@Entity
@Table(name = "turno_plantilla", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"codigo", "empresa_id"})
})
public class TurnoPlantilla {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private com.horus.asistencia.organizacion.model.Empresa empresa;

    @Column(nullable = false)
    private String codigo;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "tipo_turno", nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoTurno tipoTurno;

    @Column(name = "es_nocturno")
    private boolean esNocturno;

    @Column(name = "min_break_mins")
    private int minBreakMins;

    @Column(name = "max_break_mins")
    private int maxBreakMins;

    @Column(name = "tolerancia_entrada_mins")
    private int toleranciaEntradaMins;

    @Column(name = "tolerancia_salida_mins")
    private int toleranciaSalidaMins;

    @OneToMany(mappedBy = "turnoPlantilla", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private List<TurnoSegmento> segmentos;

    public enum TipoTurno {
        FIJO, FLEXIBLE, ABIERTO
    }
}
