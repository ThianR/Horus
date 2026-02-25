package com.oculus.asistencia.motor.repository;

import com.oculus.asistencia.motor.model.AsistenciaDia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface AsistenciaDiaRepository extends JpaRepository<AsistenciaDia, Long> {

    Optional<AsistenciaDia> findByEmpleadoIdAndFechaLaboral(Long empleadoId, LocalDate fechaLaboral);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM AsistenciaDia a WHERE a.fechaLaboral = :fecha")
    long countTotalAsistenciasPorFecha(LocalDate fecha);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM AsistenciaDia a WHERE a.fechaLaboral = :fecha AND a.horaEntradaReal IS NOT NULL")
    long countPresentesPorFecha(LocalDate fecha);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM AsistenciaDia a WHERE a.fechaLaboral = :fecha AND a.estadoAsistencia = 'TARDANZA'")
    long countTardanzasPorFecha(LocalDate fecha);

    java.util.List<AsistenciaDia> findAllByFechaLaboralOrderByHoraEntradaRealDesc(LocalDate fecha);
}
