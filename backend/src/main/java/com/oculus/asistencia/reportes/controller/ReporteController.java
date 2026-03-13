package com.oculus.asistencia.reportes.controller;

import com.oculus.asistencia.motor.model.AsistenciaDia;
import com.oculus.asistencia.motor.repository.AsistenciaDiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final AsistenciaDiaRepository asistenciaRepository;
    private final com.oculus.asistencia.reportes.service.ReporteService reporteService;
    private final com.oculus.asistencia.reportes.service.ImportacionService importacionService;
    private final com.oculus.asistencia.organizacion.service.EmpresaService empresaService;
    private final com.oculus.asistencia.marcas.repository.MarcacionEventoRepository marcacionEventoRepository;
    private final com.oculus.asistencia.rrhh.repository.EmpleadoRepository empleadoRepository;

    @GetMapping
    public List<AsistenciaDia> listarAsistencias(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate inicio,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate fin,
            @RequestParam(required = false) Long sedeId,
            @RequestParam(required = false) Long empleadoId) {
        
        Long empresaId = empresaService.getEmpresaDefault().getId();
        return reporteService.buscarAsistencias(empresaId, inicio, fin, sedeId, empleadoId);
    }

    @GetMapping("/seed")
    public ResponseEntity<String> seedTestData() {
        var empleadoOpt = empleadoRepository.findAll().stream().findFirst();
        if (empleadoOpt.isEmpty())
            return ResponseEntity.badRequest().body("No hay empleados para seed");

        var emp = empleadoOpt.get();
        java.time.LocalDateTime base = java.time.LocalDateTime.now().minusDays(1).withHour(8).withMinute(0);

        for (int i = 0; i < 5; i++) {
            com.oculus.asistencia.marcas.model.MarcacionEvento e = new com.oculus.asistencia.marcas.model.MarcacionEvento();
            e.setUuid(java.util.UUID.randomUUID().toString());
            e.setEmpleado(emp);
            e.setTimestampEvento(base.plusDays(i));
            e.setTipoEvento(com.oculus.asistencia.marcas.model.MarcacionEvento.TipoEvento.ENTRADA);
            e.setEstadoProceso(com.oculus.asistencia.marcas.model.MarcacionEvento.EstadoProceso.PENDIENTE);
            e.setMetodoVerificacion("SEED_TEST");
            marcacionEventoRepository.save(e);

            com.oculus.asistencia.marcas.model.MarcacionEvento s = new com.oculus.asistencia.marcas.model.MarcacionEvento();
            s.setUuid(java.util.UUID.randomUUID().toString());
            s.setEmpleado(emp);
            s.setTimestampEvento(base.plusDays(i).plusHours(9));
            s.setTipoEvento(com.oculus.asistencia.marcas.model.MarcacionEvento.TipoEvento.SALIDA);
            s.setEstadoProceso(com.oculus.asistencia.marcas.model.MarcacionEvento.EstadoProceso.PENDIENTE);
            s.setMetodoVerificacion("SEED_TEST");
            marcacionEventoRepository.save(s);

            // También generamos el registro de asistencia procesado para visualización inmediata
            AsistenciaDia ad = new AsistenciaDia();
            ad.setEmpleado(emp);
            ad.setEmpresa(emp.getEmpresa());
            ad.setFechaLaboral(base.plusDays(i).toLocalDate());
            ad.setHoraEntradaReal(base.plusDays(i));
            ad.setHoraSalidaReal(base.plusDays(i).plusHours(9));
            ad.setMinsTardanza(i == 1 ? 15 : 0);
            ad.setEstadoAsistencia(i == 1 ? AsistenciaDia.EstadoAsistencia.TARDANZA : AsistenciaDia.EstadoAsistencia.NORMAL);
            asistenciaRepository.save(ad);
        }

        return ResponseEntity.ok("Datos de prueba generados para: " + emp.getNombreCompleto() + " (Código: "
                + emp.getCodigoEmpleado() + ")");
    }

    @GetMapping("/asistencia.csv")
    public ResponseEntity<byte[]> exportarAsistenciaCsv() {
        List<AsistenciaDia> asistencias = asistenciaRepository.findAllByEmpresaId(empresaService.getEmpresaDefault().getId());

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
        byte[] data = reporteService.generarExcelAsistencia(empresaService.getEmpresaDefault().getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=asistencia.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    @GetMapping("/asistencia.pdf")
    public ResponseEntity<byte[]> exportarAsistenciaPdf() {
        byte[] data = reporteService.generarPdfAsistencia(empresaService.getEmpresaDefault().getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=asistencia.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }

    @GetMapping("/asistencia.dat")
    public ResponseEntity<byte[]> exportarAsistenciaZkt() {
        byte[] data = reporteService.generarZktLogs(empresaService.getEmpresaDefault().getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=GLOG_001.dat")
                .contentType(MediaType.TEXT_PLAIN)
                .body(data);
    }

    @PostMapping("/importar")
    public ResponseEntity<String> importarLogs(@RequestParam("file") MultipartFile file) throws java.io.IOException {
        int procesados = importacionService.importarDesdeArchivoZkt(file.getInputStream(), empresaService.getEmpresaDefault());
        return ResponseEntity.ok("Importación finalizada. Registros procesados: " + procesados);
    }
}
