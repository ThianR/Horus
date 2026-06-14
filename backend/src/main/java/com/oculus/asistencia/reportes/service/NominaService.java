package com.oculus.asistencia.reportes.service;

import com.oculus.asistencia.motor.model.AsistenciaDia;
import com.oculus.asistencia.motor.repository.AsistenciaDiaRepository;
import com.oculus.asistencia.reportes.dto.NominaEmpleadoDto;
import com.oculus.asistencia.rrhh.model.Empleado;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NominaService {

    private final AsistenciaDiaRepository asistenciaDiaRepository;

    public List<NominaEmpleadoDto> calcularNomina(Long empresaId, LocalDate inicio, LocalDate fin) {
        List<AsistenciaDia> asistencias = asistenciaDiaRepository.findAllByEmpresaIdAndFechaLaboralBetweenOrderByFechaLaboralDesc(empresaId, inicio, fin);

        // Group by Empleado
        Map<Empleado, List<AsistenciaDia>> agrupado = asistencias.stream()
                .collect(Collectors.groupingBy(AsistenciaDia::getEmpleado));

        List<NominaEmpleadoDto> nominas = new ArrayList<>();

        for (Map.Entry<Empleado, List<AsistenciaDia>> entry : agrupado.entrySet()) {
            Empleado emp = entry.getKey();
            List<AsistenciaDia> dias = entry.getValue();

            int diasTrabajados = 0;
            int diasFalta = 0;
            int diasLicencia = 0;
            int minsTrabajados = 0;
            int minsTardanza = 0;
            int minsExtra = 0;

            for (AsistenciaDia dia : dias) {
                if (dia.getEstadoAsistencia() == AsistenciaDia.EstadoAsistencia.FALTA) {
                    diasFalta++;
                } else if (dia.getEmpleado().getEstado() == Empleado.EstadoEmpleado.LICENCIA) {
                    diasLicencia++;
                } else {
                    if (dia.getHoraEntradaReal() != null) {
                        diasTrabajados++;
                    }
                }
                minsTrabajados += dia.getMinsTrabajadosReales();
                minsTardanza += dia.getMinsTardanza();
                minsExtra += dia.getMinsExtraDespues();
            }

            nominas.add(NominaEmpleadoDto.builder()
                    .empleadoId(emp.getId())
                    .nombreCompleto(emp.getNombreCompleto())
                    .codigoEmpleado(emp.getCodigoEmpleado())
                    .numeroDocumento(emp.getNumeroDocumento())
                    .totalDiasTrabajados(diasTrabajados)
                    .totalDiasFalta(diasFalta)
                    .totalDiasLicencia(diasLicencia)
                    .totalMinsTrabajados(minsTrabajados)
                    .totalMinsTardanza(minsTardanza)
                    .totalMinsExtra(minsExtra)
                    .build());
        }

        return nominas;
    }

    public byte[] exportarNominaAExcel(Long empresaId, LocalDate inicio, LocalDate fin) throws IOException {
        List<NominaEmpleadoDto> nominas = calcularNomina(empresaId, inicio, fin);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Nómina");

            // Header
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("CÓDIGO");
            headerRow.createCell(1).setCellValue("DOCUMENTO");
            headerRow.createCell(2).setCellValue("NOMBRE COMPLETO");
            headerRow.createCell(3).setCellValue("DÍAS TRABAJADOS");
            headerRow.createCell(4).setCellValue("DÍAS FALTA");
            headerRow.createCell(5).setCellValue("DÍAS LICENCIA");
            headerRow.createCell(6).setCellValue("HORAS TRABAJADAS");
            headerRow.createCell(7).setCellValue("HORAS EXTRA");
            headerRow.createCell(8).setCellValue("HORAS TARDANZA");

            // Data
            int rowIdx = 1;
            for (NominaEmpleadoDto nomina : nominas) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(nomina.getCodigoEmpleado());
                row.createCell(1).setCellValue(nomina.getNumeroDocumento());
                row.createCell(2).setCellValue(nomina.getNombreCompleto());
                row.createCell(3).setCellValue(nomina.getTotalDiasTrabajados());
                row.createCell(4).setCellValue(nomina.getTotalDiasFalta());
                row.createCell(5).setCellValue(nomina.getTotalDiasLicencia());
                row.createCell(6).setCellValue(Math.round(nomina.getTotalHorasTrabajadas() * 100.0) / 100.0);
                row.createCell(7).setCellValue(Math.round(nomina.getTotalHorasExtra() * 100.0) / 100.0);
                row.createCell(8).setCellValue(Math.round(nomina.getTotalHorasTardanza() * 100.0) / 100.0);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
