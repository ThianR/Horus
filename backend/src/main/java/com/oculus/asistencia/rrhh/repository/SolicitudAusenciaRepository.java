package com.oculus.asistencia.rrhh.repository;

import com.oculus.asistencia.rrhh.model.SolicitudAusencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudAusenciaRepository extends JpaRepository<SolicitudAusencia, Long> {
    List<SolicitudAusencia> findByEmpleadoIdOrderByCreatedAtDesc(Long empleadoId);
    List<SolicitudAusencia> findByEstadoOrderByCreatedAtDesc(SolicitudAusencia.EstadoSolicitud estado);
    List<SolicitudAusencia> findAllByOrderByCreatedAtDesc();
}
