package com.horus.asistencia.turnos.repository;

import com.horus.asistencia.turnos.model.AsignacionTurno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface AsignacionTurnoRepository extends JpaRepository<AsignacionTurno, Long> {

        @Query("SELECT a FROM AsignacionTurno a WHERE a.empleado.id = :empleadoId")
        List<AsignacionTurno> findAllByEmpleadoId(@Param("empleadoId") Long empleadoId);

        List<AsignacionTurno> findAllByEmpresaId(Long empresaId);

        @Modifying
        @Query("DELETE FROM AsignacionTurno a WHERE a.empleado.id = :empleadoId")
        void deleteByEmpleadoId(@Param("empleadoId") Long empleadoId);
}
