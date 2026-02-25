package com.oculus.asistencia.motor.controller;

import com.oculus.asistencia.marcas.model.MarcacionEvento;
import com.oculus.asistencia.marcas.repository.MarcacionEventoRepository;
import com.oculus.asistencia.motor.model.AsistenciaDia;
import com.oculus.asistencia.motor.repository.AsistenciaDiaRepository;
import com.oculus.asistencia.rrhh.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final AsistenciaDiaRepository asistenciaRepository;
    private final MarcacionEventoRepository marcacionRepository;
    private final EmpleadoRepository empleadoRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        LocalDate hoy = LocalDate.now();
        long totalEmpleados = empleadoRepository.count();
        long totalAsistencias = asistenciaRepository.countTotalAsistenciasPorFecha(hoy);
        long presentes = asistenciaRepository.countPresentesPorFecha(hoy);
        long tardanzas = asistenciaRepository.countTardanzasPorFecha(hoy);

        // Alertas: Tardanzas del día
        long alertas = tardanzas;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEmpleados", totalEmpleados);
        stats.put("totalMarcacionesHoy", totalAsistencias);
        stats.put("presentesHoy", presentes);
        stats.put("tardanzasHoy", tardanzas);
        stats.put("alertas", alertas);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/eventos-recientes")
    public ResponseEntity<List<Map<String, Object>>> getEventosRecientes() {
        List<MarcacionEvento> eventos = marcacionRepository.findUltimasDiez();

        List<Map<String, Object>> result = eventos.stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", e.getUuid());
            map.put("empleadoNombre", e.getEmpleado().getNombreCompleto());
            map.put("codigoEmpleado", e.getEmpleado().getCodigoEmpleado());
            map.put("timestamp", e.getTimestampEvento());
            map.put("tipo", e.getTipoEvento());
            map.put("metodo", e.getMetodoVerificacion());
            map.put("estado", e.getEstadoProceso());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/asistencias-hoy")
    public ResponseEntity<List<AsistenciaDia>> getAsistenciasHoy() {
        LocalDate hoy = LocalDate.now();
        List<AsistenciaDia> asistencias = asistenciaRepository.findAllByFechaLaboralOrderByHoraEntradaRealDesc(hoy);
        return ResponseEntity.ok(asistencias);
    }
}
