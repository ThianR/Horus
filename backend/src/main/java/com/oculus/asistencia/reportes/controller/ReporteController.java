package com.oculus.asistencia.reportes.controller;

import com.oculus.asistencia.motor.model.AsistenciaDia;
import com.oculus.asistencia.motor.repository.AsistenciaDiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final AsistenciaDiaRepository asistenciaRepository;
    private final com.oculus.asistencia.reportes.service.ReporteService reporteService;

    @GetMapping("/asistencia.csv")
    public ResponseEntity<byte[]> exportarAsistenciaCsv() {
        List<AsistenciaDia> asistencias = asistenciaRepository.findAll();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out)) {
            writer.println("ID,Fecha,Empleado,Turno,Entrada,Salida,Estado,Tardanza(min),Extra(min)");
            for (AsistenciaDia a : asistencias) {
                writer.printf("%d,%s,%s,%s,%s,%s,%s,%d,%d%n",
                        a.getId(),
                        a.getFechaLaboral(),
                        a.getEmpleado().getNombreCompleto(),
                        a.getTurnoAsignado() != null ? a.getTurnoAsignado().getNombre() : "N/A",
                        a.getHoraEntradaReal(),
                        a.getHoraSalidaReal(),
                        a.getEstadoAsistencia(),
                        a.getMinsTardanza(),
                        a.getMinsExtraDespues());
            }
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=asistencia.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(out.toByteArray());
    }

    @GetMapping("/asistencia.xlsx")
    public ResponseEntity<byte[]> exportarAsistenciaExcel() throws java.io.IOException {
        byte[] data = reporteService.generarExcelAsistencia();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=asistencia.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    @GetMapping("/asistencia.pdf")
    public ResponseEntity<byte[]> exportarAsistenciaPdf() {
        byte[] data = reporteService.generarPdfAsistencia();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=asistencia.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }
}
