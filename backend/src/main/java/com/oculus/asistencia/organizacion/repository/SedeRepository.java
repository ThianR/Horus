package com.oculus.asistencia.organizacion.repository;

import com.oculus.asistencia.organizacion.model.Sede;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SedeRepository extends JpaRepository<Sede, Long> {
}
