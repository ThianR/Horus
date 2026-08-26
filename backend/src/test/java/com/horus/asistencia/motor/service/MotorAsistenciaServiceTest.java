package com.horus.asistencia.motor.service;

import com.horus.asistencia.marcas.model.MarcacionEvento;
import com.horus.asistencia.motor.model.AsistenciaDia;
import com.horus.asistencia.motor.model.ReglaAsistencia;
import com.horus.asistencia.motor.repository.AsistenciaDiaRepository;
import com.horus.asistencia.rrhh.model.Empleado;
import com.horus.asistencia.turnos.model.AsignacionTurno;
import com.horus.asistencia.turnos.model.TurnoPlantilla;
import com.horus.asistencia.turnos.model.TurnoSegmento;
import com.horus.asistencia.turnos.repository.AsignacionTurnoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.ArgumentCaptor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MotorAsistenciaServiceTest {

    @Mock
    private AsistenciaDiaRepository asistenciaRepository;
    @Mock
    private AsignacionTurnoRepository asignacionTurnoRepository;
    @Mock
    private ConfiguracionMotorService configuracionService;

    @InjectMocks
    private MotorAsistenciaService motorService;

    private Empleado empleado;
    private TurnoPlantilla turnoDia;
    private TurnoPlantilla turnoNoche;
    private ReglaAsistencia reglaDefault;

    @BeforeEach
    void setUp() {
        empleado = new Empleado();
        empleado.setId(1L);
        empleado.setNombreCompleto("Juan Perez");

        TurnoSegmento segDia = new TurnoSegmento();
        segDia.setHoraEntrada(LocalTime.of(8, 0));
        segDia.setHoraSalida(LocalTime.of(17, 0));
        segDia.setToleranciaTardanzaMins(15);
        segDia.setToleranciaSalidaAnticipadaMins(5);

        turnoDia = new TurnoPlantilla();
        turnoDia.setId(1L);
        turnoDia.setEsNocturno(false);
        turnoDia.setNombre("Turno Dia");
        turnoDia.setSegmentos(List.of(segDia));

        TurnoSegmento segNoche = new TurnoSegmento();
        segNoche.setHoraEntrada(LocalTime.of(22, 0));
        segNoche.setHoraSalida(LocalTime.of(6, 0));
        segNoche.setDiaSiguienteSalida(true);

        turnoNoche = new TurnoPlantilla();
        turnoNoche.setId(2L);
        turnoNoche.setEsNocturno(true);
        turnoNoche.setNombre("Turno Noche");
        turnoNoche.setSegmentos(List.of(segNoche));

        reglaDefault = new ReglaAsistencia();
        reglaDefault.setToleranciaEntrada(0);
        reglaDefault.setToleranciaSalida(0);
        reglaDefault.setPermiteHorasExtra(true);
        reglaDefault.setMinMinsParaExtra(30);
    }

    @Test
    void testTardanza_DentroDeTolerancia() {
        LocalDate fecha = LocalDate.of(2023, 10, 10);
        LocalDateTime entrada = LocalDateTime.of(fecha, LocalTime.of(8, 10)); // 10 mins tarde

        MarcacionEvento evento = crearEvento(empleado, entrada, MarcacionEvento.TipoEvento.ENTRADA);
        AsignacionTurno asignacion = new AsignacionTurno();
        asignacion.setTurnoPlantilla(turnoDia);
        asignacion.setFechaInicio(LocalDate.of(2020, 1, 1));

        when(asignacionTurnoRepository.findAllByEmpleadoId(any())).thenReturn(List.of(asignacion));
        when(configuracionService.resolverRegla(any(), any(), any())).thenReturn(reglaDefault);
        when(asistenciaRepository.findByEmpleadoIdAndFechaLaboral(any(), any())).thenReturn(Optional.empty());

        motorService.procesarMarcacion(evento);

        ArgumentCaptor<AsistenciaDia> captor = ArgumentCaptor.forClass(AsistenciaDia.class);
        verify(asistenciaRepository).save(captor.capture());
        AsistenciaDia res = captor.getValue();

        assertEquals(0, res.getMinsTardanza());
        assertEquals(AsistenciaDia.EstadoAsistencia.NORMAL, res.getEstadoAsistencia());
    }

    @Test
    void testTardanza_FueraDeTolerancia() {
        LocalDate fecha = LocalDate.of(2023, 10, 10);
        LocalDateTime entrada = LocalDateTime.of(fecha, LocalTime.of(8, 20)); // 20 mins tarde (tolerancia es 15)

        MarcacionEvento evento = crearEvento(empleado, entrada, MarcacionEvento.TipoEvento.ENTRADA);
        AsignacionTurno asignacion = new AsignacionTurno();
        asignacion.setTurnoPlantilla(turnoDia);
        asignacion.setFechaInicio(LocalDate.of(2020, 1, 1));

        when(asignacionTurnoRepository.findAllByEmpleadoId(any())).thenReturn(List.of(asignacion));
        when(configuracionService.resolverRegla(any(), any(), any())).thenReturn(reglaDefault);
        when(asistenciaRepository.findByEmpleadoIdAndFechaLaboral(any(), any())).thenReturn(Optional.empty());

        motorService.procesarMarcacion(evento);

        ArgumentCaptor<AsistenciaDia> captor = ArgumentCaptor.forClass(AsistenciaDia.class);
        verify(asistenciaRepository).save(captor.capture());
        AsistenciaDia res = captor.getValue();

        assertEquals(20, res.getMinsTardanza());
        assertEquals(AsistenciaDia.EstadoAsistencia.TARDANZA, res.getEstadoAsistencia());
    }

    @Test
    void testSalidaAnticipada() {
        LocalDate fecha = LocalDate.of(2023, 10, 10);
        LocalDateTime salida = LocalDateTime.of(fecha, LocalTime.of(16, 40)); // 20 mins antes

        AsistenciaDia existente = new AsistenciaDia();
        existente.setFechaLaboral(fecha);
        existente.setHoraEntradaReal(LocalDateTime.of(fecha, LocalTime.of(8, 0)));
        existente.setEstadoAsistencia(AsistenciaDia.EstadoAsistencia.NORMAL);

        MarcacionEvento evento = crearEvento(empleado, salida, MarcacionEvento.TipoEvento.SALIDA);
        AsignacionTurno asignacion = new AsignacionTurno();
        asignacion.setTurnoPlantilla(turnoDia);
        asignacion.setFechaInicio(LocalDate.of(2020, 1, 1));

        when(asignacionTurnoRepository.findAllByEmpleadoId(any())).thenReturn(List.of(asignacion));
        when(configuracionService.resolverRegla(any(), any(), any())).thenReturn(reglaDefault);
        when(asistenciaRepository.findByEmpleadoIdAndFechaLaboral(any(), any())).thenReturn(Optional.of(existente));

        motorService.procesarMarcacion(evento);

        assertEquals(20, existente.getMinsSalidaAnticipada());
        assertEquals(AsistenciaDia.EstadoAsistencia.INCOMPLETO, existente.getEstadoAsistencia());
    }

    @Test
    void testHorasExtra() {
        LocalDate fecha = LocalDate.of(2023, 10, 10);
        LocalDateTime salida = LocalDateTime.of(fecha, LocalTime.of(18, 0)); // 1 hora extra

        AsistenciaDia existente = new AsistenciaDia();
        existente.setFechaLaboral(fecha);
        existente.setHoraEntradaReal(LocalDateTime.of(fecha, LocalTime.of(8, 0)));

        MarcacionEvento evento = crearEvento(empleado, salida, MarcacionEvento.TipoEvento.SALIDA);
        AsignacionTurno asignacion = new AsignacionTurno();
        asignacion.setTurnoPlantilla(turnoDia);
        asignacion.setFechaInicio(LocalDate.of(2020, 1, 1));

        when(asignacionTurnoRepository.findAllByEmpleadoId(any())).thenReturn(List.of(asignacion));
        when(configuracionService.resolverRegla(any(), any(), any())).thenReturn(reglaDefault);
        when(asistenciaRepository.findByEmpleadoIdAndFechaLaboral(any(), any())).thenReturn(Optional.of(existente));

        motorService.procesarMarcacion(evento);

        assertEquals(60, existente.getMinsExtraDespues());
    }

    @Test
    void testTurnoNoche_CruceDia() {
        LocalDate fechaInicio = LocalDate.of(2023, 10, 10);
        LocalDate fechaFin = LocalDate.of(2023, 10, 11);
        LocalDateTime entrada = LocalDateTime.of(fechaInicio, LocalTime.of(22, 0));
        LocalDateTime salida = LocalDateTime.of(fechaFin, LocalTime.of(6, 0));

        AsignacionTurno asignacion = new AsignacionTurno();
        asignacion.setTurnoPlantilla(turnoNoche);
        asignacion.setFechaInicio(LocalDate.of(2020, 1, 1));

        when(asignacionTurnoRepository.findAllByEmpleadoId(any())).thenReturn(List.of(asignacion));
        when(configuracionService.resolverRegla(any(), any(), any())).thenReturn(reglaDefault);

        // 1. Procesar Entrada
        MarcacionEvento evEntrada = crearEvento(empleado, entrada, MarcacionEvento.TipoEvento.ENTRADA);
        when(asistenciaRepository.findByEmpleadoIdAndFechaLaboral(eq(1L), eq(fechaInicio)))
                .thenReturn(Optional.empty());

        motorService.procesarMarcacion(evEntrada);

        ArgumentCaptor<AsistenciaDia> captor = ArgumentCaptor.forClass(AsistenciaDia.class);
        verify(asistenciaRepository, atLeastOnce()).save(captor.capture());
        AsistenciaDia asistencia = captor.getValue();
        assertEquals(fechaInicio, asistencia.getFechaLaboral());

        // 2. Procesar Salida (Día siguiente)
        MarcacionEvento evSalida = crearEvento(empleado, salida, MarcacionEvento.TipoEvento.SALIDA);
        // El motor debe buscar la asistencia del dia 10 porque es nocturno y marca
        // salida antes del mediodia
        when(asistenciaRepository.findByEmpleadoIdAndFechaLaboral(eq(1L), eq(fechaInicio)))
                .thenReturn(Optional.of(asistencia));

        motorService.procesarMarcacion(evSalida);

        assertEquals(fechaInicio, asistencia.getFechaLaboral());
        assertEquals(entrada, asistencia.getHoraEntradaReal());
        assertEquals(salida, asistencia.getHoraSalidaReal());
        assertEquals(480, asistencia.getMinsTrabajadosReales()); // 8 horas
    }

    private MarcacionEvento crearEvento(Empleado emp, LocalDateTime ts, MarcacionEvento.TipoEvento tipo) {
        MarcacionEvento ev = new MarcacionEvento();
        ev.setUuid(java.util.UUID.randomUUID().toString());
        ev.setEmpleado(emp);
        ev.setTimestampEvento(ts);
        ev.setTipoEvento(tipo);
        return ev;
    }
}
