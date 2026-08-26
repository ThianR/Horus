package com.horus.asistencia.reportes.service;

import com.horus.asistencia.organizacion.model.Empresa;
import com.horus.asistencia.marcas.model.MarcacionEvento;
import com.horus.asistencia.marcas.repository.MarcacionEventoRepository;
import com.horus.asistencia.rrhh.model.Empleado;
import com.horus.asistencia.rrhh.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImportacionService {

    private final MarcacionEventoRepository marcacionRepository;
    private final EmpleadoRepository empleadoRepository;

    private static final DateTimeFormatter ZK_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional
    public int importarDesdeArchivoZkt(InputStream inputStream, Empresa empresa) {
        int procesados = 0;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty())
                    continue;

                // Split por cualquier espacio en blanco o tabs (ZKTeco usa tabs usualmente)
                String[] parts = line.split("\\s+");

                if (parts.length < 3)
                    continue;

                String codigoEmpleado = parts[0];
                // El formato suele ser: Código [espacio] Fecha [espacio] Hora [espacio] Status
                // Ejemplo: 101 2023-10-25 08:00:00 0
                String timestampStr = parts[1] + " " + parts[2];

                try {
                    LocalDateTime timestamp = LocalDateTime.parse(timestampStr, ZK_FORMAT);

                    var empleadoOpt = empleadoRepository.findByCodigoEmpleadoAndEmpresaId(codigoEmpleado, empresa.getId());
                    if (empleadoOpt.isEmpty()) {
                        log.warn("Importación: Empleado con código {} no encontrado en empresa {}.", codigoEmpleado, empresa.getNombre());
                        continue;
                    }

                    Empleado empleado = empleadoOpt.get();

                    if (marcacionRepository.existsByEmpleadoIdAndTimestampEvento(empleado.getId(), timestamp)) {
                        continue;
                    }

                    MarcacionEvento evento = new MarcacionEvento();
                    evento.setUuid(UUID.randomUUID().toString());
                    evento.setEmpleado(empleado);
                    evento.setEmpresa(empresa);
                    evento.setTimestampEvento(timestamp);
                    evento.setTimestampServidor(LocalDateTime.now());

                    // Status legacy: 0=Entrada, 1=Salida
                    int statusInt = (parts.length > 3) ? Integer.parseInt(parts[3]) : 0;
                    evento.setTipoEvento(
                            statusInt == 0 ? MarcacionEvento.TipoEvento.ENTRADA : MarcacionEvento.TipoEvento.SALIDA);

                    evento.setMetodoVerificacion("IMPORT_ZKT_LEGACY");
                    evento.setEstadoProceso(MarcacionEvento.EstadoProceso.PENDIENTE);

                    marcacionRepository.save(evento);
                    procesados++;

                } catch (Exception ex) {
                    log.error("Error en línea: {}. {}", line, ex.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Error crítico de importación: {}", e.getMessage());
        }
        return procesados;
    }
}
