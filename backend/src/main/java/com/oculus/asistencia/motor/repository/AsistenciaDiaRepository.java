package com.oculus.asistencia.motor.repository;

import com.oculus.asistencia.motor.model.AsistenciaDia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AsistenciaDiaRepository extends JpaRepository<AsistenciaDia, Long> {

    Optional<AsistenciaDia> findByEmpleadoIdAndFechaLaboral(Long empleadoId, LocalDate fechaLaboral);

    List<AsistenciaDia> findAllByEmpresaId(Long empresaId);

    List<AsistenciaDia> findByFechaLaboralBetween(LocalDate inicio, LocalDate fin);

    List<AsistenciaDia> findAllByEmpresaIdAndFechaLaboralBetweenOrderByFechaLaboralDesc(Long empresaId, LocalDate inicio, LocalDate fin);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM AsistenciaDia a WHERE a.fechaLaboral = :fecha AND a.empresa.id = :empresaId")
    long countTotalAsistenciasPorFechaAndEmpresaId(@org.springframework.data.repository.query.Param("fecha") LocalDate fecha, @org.springframework.data.repository.query.Param("empresaId") Long empresaId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM AsistenciaDia a WHERE a.fechaLaboral = :fecha AND a.horaEntradaReal IS NOT NULL AND a.empresa.id = :empresaId")
    long countPresentesPorFechaAndEmpresaId(@org.springframework.data.repository.query.Param("fecha") LocalDate fecha, @org.springframework.data.repository.query.Param("empresaId") Long empresaId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM AsistenciaDia a WHERE a.fechaLaboral = :fecha AND a.estadoAsistencia = 'TARDANZA' AND a.empresa.id = :empresaId")
    long countTardanzasPorFechaAndEmpresaId(@org.springframework.data.repository.query.Param("fecha") LocalDate fecha, @org.springframework.data.repository.query.Param("empresaId") Long empresaId);

    java.util.List<AsistenciaDia> findAllByFechaLaboralAndEmpresaIdOrderByHoraEntradaRealDesc(LocalDate fecha, Long empresaId);
}
