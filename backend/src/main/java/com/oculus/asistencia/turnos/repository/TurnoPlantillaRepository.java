package com.oculus.asistencia.turnos.repository;

import com.oculus.asistencia.turnos.model.TurnoPlantilla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TurnoPlantillaRepository extends JpaRepository<TurnoPlantilla, Long> {
    Optional<TurnoPlantilla> findByCodigo(String codigo);
}
