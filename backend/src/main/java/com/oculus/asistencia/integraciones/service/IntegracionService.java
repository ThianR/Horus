package com.oculus.asistencia.integraciones.service;

import com.oculus.asistencia.marcas.model.MarcacionEvento;
import com.oculus.asistencia.marcas.repository.MarcacionEventoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class IntegracionService {

    private final MarcacionEventoRepository marcacionRepository;

    public Page<MarcacionDto> obtenerMarcaciones(Long empresaId, LocalDateTime inicio, LocalDateTime fin, String dni, Pageable pageable) {
        log.info("Obteniendo marcaciones para integracion. EmpresaId: {}", empresaId);
        
        Page<MarcacionEvento> eventos = marcacionRepository.findAllByEmpresaIdAndTimestampEventoBetween(empresaId, inicio, fin, pageable);
        
        return eventos.map(this::mapearADto);
    }

    private MarcacionDto mapearADto(MarcacionEvento evento) {
        return new MarcacionDto(
                evento.getUuid(),
                evento.getEmpleado().getNumeroDocumento(),
                evento.getEmpleado().getNombreCompleto(),
                evento.getTimestampEvento(),
                evento.getTipoEvento().name(),
                evento.getSede() != null ? evento.getSede().getNombre() : "Desconocida",
                evento.getEstadoProceso().name()
        );
    }

    public record MarcacionDto(
            String id,
            String dni,
            String nombre,
            LocalDateTime timestamp,
            String tipo,
            String sede,
            String estado
    ) {}
}
