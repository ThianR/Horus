package com.horus.asistencia.motor.service;

import com.horus.asistencia.motor.model.AsistenciaDia;
import com.horus.asistencia.motor.repository.AsistenciaDiaRepository;
import com.horus.asistencia.organizacion.model.Empresa;
import com.horus.asistencia.organizacion.repository.EmpresaRepository;
import com.horus.asistencia.rrhh.model.Empleado;
import com.horus.asistencia.rrhh.repository.EmpleadoRepository;
import com.horus.asistencia.turnos.model.AsignacionTurno;
import com.horus.asistencia.turnos.repository.AsignacionTurnoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CierreDiaService {

    private final EmpresaRepository empresaRepository;
    private final EmpleadoRepository empleadoRepository;
    private final AsignacionTurnoRepository asignacionTurnoRepository;
    private final AsistenciaDiaRepository asistenciaRepository;

    /**
     * Tarea programada para ejecutarse todos los días a las 00:05
     */
    @Scheduled(cron = "0 5 0 * * *")
    public void ejecutarCierreAutomatico() {
        log.info("Iniciando cierre de día automático...");
        LocalDate ayer = LocalDate.now().minusDays(1);
        
        List<Empresa> empresas = empresaRepository.findAll();
        for (Empresa empresa : empresas) {
            if (empresa.isCierreDiaAutomatico()) {
                procesarCierreEmpresa(empresa.getId(), ayer);
            }
        }
    }

    /**
     * Ejecuta el cierre manual para una empresa y fecha específica
     */
    @Transactional
    public int procesarCierreEmpresa(Long empresaId, LocalDate fecha) {
        log.info("Ejecutando cierre de día para empresa ID: {} fecha: {}", empresaId, fecha);
        
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

        List<Empleado> empleados = empleadoRepository.findAllByEmpresaId(empresaId);
        int creados = 0;

        for (Empleado empleado : empleados) {
            if (empleado.getEstado() != Empleado.EstadoEmpleado.ACTIVO) continue;

            // Verificar si ya existe registro para ese día
            if (asistenciaRepository.findByEmpleadoIdAndFechaLaboral(empleado.getId(), fecha).isPresent()) {
                continue;
            }

            // Verificar si tenía turno asignado para esa fecha
            List<AsignacionTurno> asignaciones = asignacionTurnoRepository.findAllByEmpleadoId(empleado.getId()).stream()
                    .filter(a -> !a.getFechaInicio().isAfter(fecha) && 
                            (a.getFechaFin() == null || !a.getFechaFin().isBefore(fecha)))
                    .toList();
            
            if (!asignaciones.isEmpty()) {
                // Crear registro de FALTA
                AsistenciaDia falta = new AsistenciaDia();
                falta.setEmpleado(empleado);
                falta.setEmpresa(empresa);
                falta.setFechaLaboral(fecha);
                falta.setTurnoAsignado(asignaciones.get(0).getTurnoPlantilla());
                falta.setEstadoAsistencia(AsistenciaDia.EstadoAsistencia.FALTA);
                falta.setMinsTardanza(0);
                falta.setValidadoPorSupervisor(false);
                
                asistenciaRepository.save(falta);
                creados++;
            }
        }
        
        log.info("Cierre completado para empresa {}. Se generaron {} registros de falta.", empresa.getNombre(), creados);
        return creados;
    }
}
