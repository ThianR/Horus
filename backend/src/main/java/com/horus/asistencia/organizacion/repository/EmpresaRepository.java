package com.horus.asistencia.organizacion.repository;

import com.horus.asistencia.organizacion.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    Optional<Empresa> findByNombre(String nombre);
    Optional<Empresa> findByIdentificacionFiscal(String identificacionFiscal);
}
