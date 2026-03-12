package com.oculus.asistencia.turnos.repository;

import com.oculus.asistencia.turnos.model.TurnoPlantilla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TurnoPlantillaRepository extends JpaRepository<TurnoPlantilla, Long> {
    List<TurnoPlantilla> findAllByEmpresaId(Long empresaId);
    
    @org.springframework.data.jpa.repository.Query("SELECT t FROM TurnoPlantilla t WHERE t.empresa.id = :empresaId OR t.empresa IS NULL")
    List<TurnoPlantilla> findAllByEmpresaIdOrGlobal(@org.springframework.data.repository.query.Param("empresaId") Long empresaId);
    Optional<TurnoPlantilla> findByCodigo(String codigo);
    Optional<TurnoPlantilla> findByCodigoAndEmpresaId(String codigo, Long empresaId);
}
