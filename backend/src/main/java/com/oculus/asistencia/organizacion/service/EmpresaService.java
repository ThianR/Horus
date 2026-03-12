package com.oculus.asistencia.organizacion.service;

import com.oculus.asistencia.organizacion.model.Empresa;
import com.oculus.asistencia.organizacion.repository.EmpresaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmpresaService {
    private final EmpresaRepository empresaRepository;

    public Empresa getEmpresaDefault() {
        return empresaRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No hay empresas configuradas en el sistema"));
    }
    
    // Futura implementación: Obtener empresa desde el contexto de seguridad
    // public Empresa getEmpresaActual() { ... }
}
