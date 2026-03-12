package com.oculus.asistencia.organizacion.repository;

import com.oculus.asistencia.organizacion.model.Dispositivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DispositivoRepository extends JpaRepository<Dispositivo, Long> {
    List<Dispositivo> findBySedeId(Long sedeId);
    List<Dispositivo> findAllByEmpresaId(Long empresaId);
    Optional<Dispositivo> findByUuidHardware(String uuidHardware);
}
