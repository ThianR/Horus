package com.oculus.asistencia.rrhh.repository;

import com.oculus.asistencia.rrhh.model.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
    Optional<Empleado> findByCodigoEmpleadoAndEmpresaId(String codigoEmpleado, Long empresaId);

    Optional<Empleado> findByNumeroDocumentoAndEmpresaId(String numeroDocumento, Long empresaId);
    
    Optional<Empleado> findByNumeroDocumentoAndEstado(String numeroDocumento, Empleado.EstadoEmpleado estado);

    java.util.List<Empleado> findAllByEmpresaId(Long empresaId);
    long countByEmpresaId(Long empresaId);
}
