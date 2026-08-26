package com.horus.asistencia.rrhh.repository;

import com.horus.asistencia.rrhh.model.Empleado;
import com.horus.asistencia.rrhh.model.EmpleadoSedeHabilitada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmpleadoSedeHabilitadaRepository extends JpaRepository<EmpleadoSedeHabilitada, Long> {
    List<EmpleadoSedeHabilitada> findByEmpleado(Empleado empleado);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM EmpleadoSedeHabilitada e WHERE e.empleado.id = :empleadoId AND e.activo = true ORDER BY e.id DESC")
    java.util.Optional<EmpleadoSedeHabilitada> findFirstByEmpleadoIdAndActivoTrue(
            @org.springframework.data.repository.query.Param("empleadoId") Long empleadoId);

    void deleteByEmpleado(Empleado empleado);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM EmpleadoSedeHabilitada e WHERE e.sede.id = :sedeId AND e.activo = true")
    List<EmpleadoSedeHabilitada> findBySedeIdAndActivoTrue(@org.springframework.data.repository.query.Param("sedeId") Long sedeId);
}
