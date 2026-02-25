package com.oculus.asistencia.organizacion.repository;

import com.oculus.asistencia.organizacion.model.Dispositivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DispositivoRepository extends JpaRepository<Dispositivo, Long> {
    List<Dispositivo> findBySedeId(Long sedeId);
}
