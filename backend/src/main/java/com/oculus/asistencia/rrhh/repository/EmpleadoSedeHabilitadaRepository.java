package com.oculus.asistencia.rrhh.repository;

import com.oculus.asistencia.rrhh.model.Empleado;
import com.oculus.asistencia.rrhh.model.EmpleadoSedeHabilitada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmpleadoSedeHabilitadaRepository extends JpaRepository<EmpleadoSedeHabilitada, Long> {
    List<EmpleadoSedeHabilitada> findByEmpleado(Empleado empleado);

    void deleteByEmpleado(Empleado empleado);
}
