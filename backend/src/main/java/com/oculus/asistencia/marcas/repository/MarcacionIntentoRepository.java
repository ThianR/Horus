package com.oculus.asistencia.marcas.repository;

import com.oculus.asistencia.marcas.model.MarcacionIntento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarcacionIntentoRepository extends JpaRepository<MarcacionIntento, Long> {
    java.util.List<MarcacionIntento> findAllByEmpresaId(Long empresaId);
}
