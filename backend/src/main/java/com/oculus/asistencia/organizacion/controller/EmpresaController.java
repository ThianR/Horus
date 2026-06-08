package com.oculus.asistencia.organizacion.controller;

import com.oculus.asistencia.organizacion.model.Empresa;
import com.oculus.asistencia.organizacion.repository.EmpresaRepository;
import com.oculus.asistencia.organizacion.service.EmpresaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empresas")
@RequiredArgsConstructor
public class EmpresaController {

    private final EmpresaRepository empresaRepository;
    private final EmpresaService empresaService;

    @GetMapping
    public List<Empresa> listar() {
        return empresaRepository.findAll();
    }

    @GetMapping("/actual")
    public ResponseEntity<Empresa> obtenerActual() {
        try {
            return ResponseEntity.ok(empresaService.getEmpresaDefault());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public Empresa crear(@RequestBody Empresa empresa) {
        return empresaRepository.save(empresa);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Empresa> actualizar(@PathVariable Long id, @RequestBody Empresa empresa) {
        return empresaRepository.findById(id).map(existing -> {
            existing.setNombre(empresa.getNombre());
            existing.setIdentificacionFiscal(empresa.getIdentificacionFiscal());
            existing.setDireccion(empresa.getDireccion());
            existing.setTelefono(empresa.getTelefono());
            existing.setActivo(empresa.isActivo());
            existing.setCierreDiaAutomatico(empresa.isCierreDiaAutomatico());
            return ResponseEntity.ok(empresaRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        if (!empresaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        try {
            empresaRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("mensaje", "No se puede eliminar la empresa porque tiene sedes o registros asociados."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("mensaje", "Ocurrió un error inesperado al eliminar la empresa."));
        }
    }
}
