package com.horus.asistencia.motor.repository;

import com.horus.asistencia.motor.model.ReglaAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReglaAsistenciaRepository extends JpaRepository<ReglaAsistencia, Long> {

    List<ReglaAsistencia> findByActivoTrue();

    Optional<ReglaAsistencia> findByNivelAlcanceAndEntidadIdAndActivoTrue(
            ReglaAsistencia.NivelAlcance alcance, Long entidadId);

    Optional<ReglaAsistencia> findFirstByNivelAlcanceAndActivoTrue(ReglaAsistencia.NivelAlcance alcance);
}
