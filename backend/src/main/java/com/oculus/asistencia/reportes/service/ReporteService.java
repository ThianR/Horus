package com.oculus.asistencia.reportes.service;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.oculus.asistencia.marcas.model.MarcacionEvento;
import com.oculus.asistencia.marcas.repository.MarcacionEventoRepository;
import com.oculus.asistencia.motor.model.AsistenciaDia;
import com.oculus.asistencia.motor.repository.AsistenciaDiaRepository;
import lombok.RequiredArgsConstructor;
import java.time.format.DateTimeFormatter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final AsistenciaDiaRepository asistenciaRepository;
    private final MarcacionEventoRepository marcacionRepository;

    private static final DateTimeFormatter ZK_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public byte[] generarExcelAsistencia(Long empresaId) throws IOException {
        List<AsistenciaDia> lista = asistenciaRepository.findAllByEmpresaId(empresaId);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Asistencias");

            // Header
            Row header = sheet.createRow(0);
            String[] columns = { "Fecha", "Empleado", "Entrada", "Salida", "Tardanza (m)", "Estado" };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(columns[i]);
                CellStyle style = workbook.createCellStyle();
                org.apache.poi.ss.usermodel.Font font = workbook.createFont();
                font.setBold(true);
                style.setFont(font);
                cell.setCellStyle(style);
            }

            // Data
            int rowIdx = 1;
            for (AsistenciaDia a : lista) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(a.getFechaLaboral().toString());
                row.createCell(1).setCellValue(a.getEmpleado().getNombreCompleto());
                row.createCell(2)
                        .setCellValue(a.getHoraEntradaReal() != null ? a.getHoraEntradaReal().toString() : "-");
                row.createCell(3).setCellValue(a.getHoraSalidaReal() != null ? a.getHoraSalidaReal().toString() : "-");
                row.createCell(4).setCellValue(a.getMinsTardanza());
                row.createCell(5).setCellValue(a.getEstadoAsistencia().toString());
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] generarPdfAsistencia(Long empresaId) {
        List<AsistenciaDia> lista = asistenciaRepository.findAllByEmpresaId(empresaId);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document document = new Document();
        PdfWriter.getInstance(document, out);
        document.open();

        Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        document.add(new Paragraph("Reporte de Asistencias - Oculus", fontTitle));
        document.add(new Paragraph(" ")); // Spacer

        PdfPTable table = new PdfPTable(5);
        table.addCell("Fecha");
        table.addCell("Empleado");
        table.addCell("Entrada");
        table.addCell("Salida");
        table.addCell("Estado");

        for (AsistenciaDia a : lista) {
            table.addCell(a.getFechaLaboral().toString());
            table.addCell(a.getEmpleado().getNombreCompleto());
            table.addCell(a.getHoraEntradaReal() != null ? a.getHoraEntradaReal().toLocalTime().toString() : "-");
            table.addCell(a.getHoraSalidaReal() != null ? a.getHoraSalidaReal().toLocalTime().toString() : "-");
            table.addCell(a.getEstadoAsistencia().toString());
        }

        document.add(table);
        document.close();

        return out.toByteArray();
    }

    /**
     * Genera un archivo de logs transaccionales compatible con ZKTeco / Anviz.
     * Formato: UserID\tDateTime\tStatus\tVerifyType\tWorkCode
     */
    public byte[] generarZktLogs(Long empresaId) {
        List<MarcacionEvento> eventos = marcacionRepository.findAllByEmpresaId(empresaId);
        StringBuilder sb = new StringBuilder();

        for (MarcacionEvento e : eventos) {
            String userId = e.getEmpleado() != null ? e.getEmpleado().getCodigoEmpleado() : "0";
            String dateTime = e.getTimestampEvento().format(ZK_DATE_FORMAT);

            // Status: 0=Entrada, 1=Salida para la mayoría de sistemas legacy
            int status = e.getTipoEvento() == MarcacionEvento.TipoEvento.ENTRADA ? 0 : 1;

            // VerifyType: 15 suele representar 'Rostro' en dispositivos ZKTeco iClock/uFace
            int verifyType = 15;

            // Formato estándar: UserID DateTime Status VerifyType
            sb.append(userId).append("\t")
                    .append(dateTime).append("\t")
                    .append(status).append("\t")
                    .append(verifyType).append("\r\n");
        }

        return sb.toString().getBytes();
    }
}
