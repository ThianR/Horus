package com.horus.asistencia.identidad.repository;

import com.horus.asistencia.identidad.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
    java.util.List<Usuario> findAllByEmpresaId(Long empresaId);
}
