package com.oculus.asistencia.marcas.repository;

import com.oculus.asistencia.marcas.model.MarcacionEvento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MarcacionEventoRepository extends JpaRepository<MarcacionEvento, String> {

    // Buscar marcaciones pendientes de procesar
    List<MarcacionEvento> findByEstadoProcesoOrderByTimestampEventoAsc(MarcacionEvento.EstadoProceso estado);

    // Buscar marcaciones de un empleado en un rango
    List<MarcacionEvento> findByEmpleadoIdAndTimestampEventoBetween(Long empleadoId, LocalDateTime inicio,
            LocalDateTime fin);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM marcacion_evento ORDER BY timestamp_evento DESC LIMIT 10", nativeQuery = true)
    List<MarcacionEvento> findUltimasDiez();

    java.util.List<MarcacionEvento> findAllByEmpresaId(Long empresaId);

    org.springframework.data.domain.Page<MarcacionEvento> findAllByEmpresaIdAndTimestampEventoBetween(Long empresaId, LocalDateTime inicio, LocalDateTime fin, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM MarcacionEvento m WHERE m.empleado.id = :empleadoId")
    void deleteByEmpleadoId(@org.springframework.data.repository.query.Param("empleadoId") Long empleadoId);

    boolean existsByEmpleadoIdAndTimestampEvento(Long empleadoId, java.time.LocalDateTime timestampEvento);
}
