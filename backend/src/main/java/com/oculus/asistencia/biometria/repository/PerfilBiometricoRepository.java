package com.oculus.asistencia.biometria.repository;

import com.oculus.asistencia.biometria.model.PerfilBiometrico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PerfilBiometricoRepository extends JpaRepository<PerfilBiometrico, Long> {
    Optional<PerfilBiometrico> findByEmpleadoId(Long empleadoId);

    void deleteByEmpleadoId(Long empleadoId);
}
