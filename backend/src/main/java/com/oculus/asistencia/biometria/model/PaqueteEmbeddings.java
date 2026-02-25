package com.oculus.asistencia.biometria.model;

import com.oculus.asistencia.organizacion.model.Sede;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "paquete_embeddings")
public class PaqueteEmbeddings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sede_id")
    private Sede sede; // Nullable (Global)

    @Column(nullable = false)
    private Long version;

    @Column(name = "fecha_generacion")
    private LocalDateTime fechaGeneracion;

    @Column(name = "url_descarga")
    private String urlDescarga;

    @Column(name = "hash_paquete")
    private String hashPaquete;
}
