package com.oculus.asistencia.biometria.repository;

import com.oculus.asistencia.biometria.model.PerfilBiometrico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PerfilBiometricoRepository extends JpaRepository<PerfilBiometrico, Long> {
    Optional<PerfilBiometrico> findByEmpleadoId(Long empleadoId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM PerfilBiometrico p WHERE p.empleado.id = :empleadoId")
    void deleteByEmpleadoId(@org.springframework.data.repository.query.Param("empleadoId") Long empleadoId);
}
