package com.horus.asistencia.organizacion.repository;

import com.horus.asistencia.organizacion.model.Sede;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SedeRepository extends JpaRepository<Sede, Long> {
    java.util.Optional<Sede> findByNombreIgnoreCaseAndEmpresaId(String nombre, Long empresaId);
    java.util.Optional<Sede> findByCodigoExternoAndEmpresaId(String codigoExterno, Long empresaId);
    @org.springframework.data.jpa.repository.Query("SELECT s FROM Sede s WHERE s.empresa.id = :empresaId")
    java.util.List<Sede> findAllByEmpresaId(@org.springframework.data.repository.query.Param("empresaId") Long empresaId);
}
