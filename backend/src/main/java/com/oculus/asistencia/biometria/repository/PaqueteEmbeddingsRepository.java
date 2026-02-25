package com.oculus.asistencia.biometria.repository;

import com.oculus.asistencia.biometria.model.PaqueteEmbeddings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaqueteEmbeddingsRepository extends JpaRepository<PaqueteEmbeddings, Long> {
    Optional<PaqueteEmbeddings> findTopBySedeIdOrderByVersionDesc(Long sedeId);
}
