package com.oculus.asistencia.rrhh.service;

import com.oculus.asistencia.rrhh.model.Empleado;
import com.oculus.asistencia.rrhh.model.SolicitudAusencia;
import com.oculus.asistencia.rrhh.repository.EmpleadoRepository;
import com.oculus.asistencia.rrhh.repository.SolicitudAusenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SolicitudService {

    private final SolicitudAusenciaRepository solicitudAusenciaRepository;
    private final EmpleadoRepository empleadoRepository;

    public SolicitudAusencia crearSolicitud(String username, LocalDate fechaInicio, LocalDate fechaFin, SolicitudAusencia.TipoSolicitud tipo, String motivo) {
        Empleado empleado = empleadoRepository.findByUsuarioUsername(username)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado para el usuario actual"));

        SolicitudAusencia solicitud = SolicitudAusencia.builder()
                .empleado(empleado)
                .fechaInicio(fechaInicio)
                .fechaFin(fechaFin)
                .tipo(tipo)
                .motivo(motivo)
                .estado(SolicitudAusencia.EstadoSolicitud.PENDIENTE)
                .build();

        return solicitudAusenciaRepository.save(solicitud);
    }

    public List<SolicitudAusencia> obtenerMisSolicitudes(String username) {
        return empleadoRepository.findByUsuarioUsername(username)
                .map(empleado -> solicitudAusenciaRepository.findByEmpleadoIdOrderByCreatedAtDesc(empleado.getId()))
                .orElseGet(java.util.Collections::emptyList);
    }

    public List<SolicitudAusencia> obtenerTodasLasSolicitudes() {
        return solicitudAusenciaRepository.findAllByOrderByCreatedAtDesc();
    }

    public SolicitudAusencia actualizarEstado(Long id, SolicitudAusencia.EstadoSolicitud estado, String comentarioRevisor) {
        SolicitudAusencia solicitud = solicitudAusenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        
        solicitud.setEstado(estado);
        if (comentarioRevisor != null) {
            solicitud.setComentarioRevisor(comentarioRevisor);
        }
        
        return solicitudAusenciaRepository.save(solicitud);
    }
}
