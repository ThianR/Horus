package com.oculus.asistencia.motor.service;

import com.oculus.asistencia.marcas.model.MarcacionEvento;
import com.oculus.asistencia.motor.model.AsistenciaDia;
import com.oculus.asistencia.motor.repository.AsistenciaDiaRepository;
import com.oculus.asistencia.turnos.model.AsignacionTurno;
import com.oculus.asistencia.turnos.model.TurnoPlantilla;
import com.oculus.asistencia.turnos.repository.AsignacionTurnoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.oculus.asistencia.motor.model.ReglaAsistencia;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MotorAsistenciaService {

    private final AsistenciaDiaRepository asistenciaRepository;
    private final AsignacionTurnoRepository asignacionTurnoRepository;
    private final ConfiguracionMotorService configuracionService;

    /**
     * Procesa una marcación entrante y actualiza o crea la asistencia
     * correspondiente.
     */
    @Transactional
    public void procesarMarcacion(MarcacionEvento evento) {
        log.info("Procesando marcacion: uuid={}, empleado={}, tipo={}",
                evento.getUuid(), evento.getEmpleado().getId(), evento.getTipoEvento());

        // 1. Identificar Fecha Laboral y Turno
        Optional<AsignacionTurno> asignacionOpt = determinarAsignacionTurno(evento);

        if (asignacionOpt.isEmpty()) {
            log.warn("No se encontró turno asignado para empleado {} en fecha {}",
                    evento.getEmpleado().getId(), evento.getTimestampEvento());
            return;
        }

        AsignacionTurno asignacion = asignacionOpt.get();
        LocalDate fechaLaboral = determinarFechaLaboral(evento, asignacion);

        // 2. Obtener o Crear AsistenciaDia
        AsistenciaDia asistencia = asistenciaRepository.findByEmpleadoIdAndFechaLaboral(
                evento.getEmpleado().getId(), fechaLaboral)
                .orElseGet(() -> crearNuevaAsistencia(evento, asignacion, fechaLaboral));

        // 3. Actualizar Asistencia con la nueva marcación
        actualizarAsistencia(asistencia, evento, asignacion);

        asistenciaRepository.save(asistencia);
    }

    private void actualizarAsistencia(AsistenciaDia asistencia, MarcacionEvento evento, AsignacionTurno asignacion) {
        TurnoPlantilla turno = asignacion.getTurnoPlantilla();

        if (evento.getTipoEvento() == MarcacionEvento.TipoEvento.ENTRADA) {
            if (asistencia.getHoraEntradaReal() == null
                    || evento.getTimestampEvento().isBefore(asistencia.getHoraEntradaReal())) {
                asistencia.setHoraEntradaReal(evento.getTimestampEvento());
            }
        } else if (evento.getTipoEvento() == MarcacionEvento.TipoEvento.SALIDA) {
            if (asistencia.getHoraSalidaReal() == null
                    || evento.getTimestampEvento().isAfter(asistencia.getHoraSalidaReal())) {
                asistencia.setHoraSalidaReal(evento.getTimestampEvento());
            }
        }

        // Resolver Reglas y Calcular Tiempos
        // Asumimos sedeId del evento o empleado (simplificado: NULL por ahora si no
        // viene)
        ReglaAsistencia regla = configuracionService.resolverRegla(evento.getEmpleado(), turno, null);
        calcularTiempos(asistencia, turno, regla);
    }

    private void calcularTiempos(AsistenciaDia asistencia, TurnoPlantilla turno, ReglaAsistencia regla) {
        if (turno.getSegmentos().isEmpty())
            return;

        // MVP: Tomamos el primer segmento para los cálculos de hoy
        var segmento = turno.getSegmentos().get(0);
        LocalDateTime entradaEsperada = LocalDateTime.of(asistencia.getFechaLaboral(), segmento.getHoraEntrada());

        // Manejo de salida en día siguiente
        LocalDate fechaSalida = segmento.isDiaSiguienteSalida() ? asistencia.getFechaLaboral().plusDays(1)
                : asistencia.getFechaLaboral();
        LocalDateTime salidaEsperada = LocalDateTime.of(fechaSalida, segmento.getHoraSalida());

        // 1. Cálculo de Tardanza
        if (asistencia.getHoraEntradaReal() != null) {
            long minsDiferencia = java.time.Duration.between(entradaEsperada, asistencia.getHoraEntradaReal())
                    .toMinutes();

            // Aplicar Tolerancia (Precedencia: ReglaAsistencia > Segmento)
            int tolerancia = regla.getToleranciaEntrada() > 0 ? regla.getToleranciaEntrada()
                    : segmento.getToleranciaTardanzaMins();

            if (minsDiferencia > tolerancia) {
                asistencia.setMinsTardanza((int) minsDiferencia);
                asistencia.setEstadoAsistencia(AsistenciaDia.EstadoAsistencia.TARDANZA);
            } else {
                asistencia.setMinsTardanza(0);
                asistencia.setEstadoAsistencia(AsistenciaDia.EstadoAsistencia.NORMAL);
            }
        }

        // 2. Cálculo de Salida Anticipada
        if (asistencia.getHoraSalidaReal() != null) {
            long minsAntes = java.time.Duration.between(asistencia.getHoraSalidaReal(), salidaEsperada).toMinutes();

            if (minsAntes > regla.getToleranciaSalida()) {
                asistencia.setMinsSalidaAnticipada((int) minsAntes);
                if (asistencia.getEstadoAsistencia() == AsistenciaDia.EstadoAsistencia.NORMAL) {
                    asistencia.setEstadoAsistencia(AsistenciaDia.EstadoAsistencia.INCOMPLETO);
                }
            } else {
                asistencia.setMinsSalidaAnticipada(0);
            }
        }

        // 3. Cálculo de Horas Extra (Simple)
        if (regla.isPermiteHorasExtra() && asistencia.getHoraSalidaReal() != null) {
            long minsExtra = java.time.Duration.between(salidaEsperada, asistencia.getHoraSalidaReal()).toMinutes();
            if (minsExtra >= regla.getMinMinsParaExtra()) {
                asistencia.setMinsExtraDespues((int) minsExtra);
            } else {
                asistencia.setMinsExtraDespues(0);
            }
        }

        // 4. Totales
        if (asistencia.getHoraEntradaReal() != null && asistencia.getHoraSalidaReal() != null) {
            asistencia.setMinsTrabajadosReales((int) java.time.Duration
                    .between(asistencia.getHoraEntradaReal(), asistencia.getHoraSalidaReal()).toMinutes());
        }
    }

    private Optional<AsignacionTurno> determinarAsignacionTurno(MarcacionEvento evento) {
        return asignacionTurnoRepository.findVigentesPorEmpleado(
                evento.getEmpleado().getId(), evento.getTimestampEvento().toLocalDate())
                .stream().findFirst();
    }

    private LocalDate determinarFechaLaboral(MarcacionEvento evento, AsignacionTurno asignacion) {
        LocalDateTime ts = evento.getTimestampEvento();
        TurnoPlantilla turno = asignacion.getTurnoPlantilla();

        if (turno.isEsNocturno()) {
            if (ts.toLocalTime().isBefore(LocalTime.NOON)
                    && evento.getTipoEvento() == MarcacionEvento.TipoEvento.SALIDA) {
                return ts.toLocalDate().minusDays(1);
            }
        }
        return ts.toLocalDate();
    }

    private AsistenciaDia crearNuevaAsistencia(MarcacionEvento evento, AsignacionTurno asignacion,
            LocalDate fechaLaboral) {
        AsistenciaDia asistencia = new AsistenciaDia();
        asistencia.setEmpleado(evento.getEmpleado());
        asistencia.setFechaLaboral(fechaLaboral);
        asistencia.setTurnoAsignado(asignacion.getTurnoPlantilla());
        asistencia.setEstadoAsistencia(AsistenciaDia.EstadoAsistencia.INCOMPLETO);
        asistencia.setValidadoPorSupervisor(false);
        return asistencia;
    }
}
