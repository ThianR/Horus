package com.oculus.asistencia.motor.service;

import com.oculus.asistencia.marcas.model.MarcacionEvento;
import com.oculus.asistencia.motor.model.AsistenciaDia;
import com.oculus.asistencia.motor.repository.AsistenciaDiaRepository;
import com.oculus.asistencia.rrhh.model.Empleado;
import com.oculus.asistencia.turnos.model.AsignacionTurno;
import com.oculus.asistencia.turnos.model.TurnoPlantilla;
import com.oculus.asistencia.turnos.repository.AsignacionTurnoRepository;
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

    @InjectMocks
    private MotorAsistenciaService motorService;

    private Empleado empleado;
    private TurnoPlantilla turnoDia;
    private TurnoPlantilla turnoNoche;

    @BeforeEach
    void setUp() {
        empleado = new Empleado();
        empleado.setId(1L);
        empleado.setNombreCompleto("Juan Perez");

        turnoDia = new TurnoPlantilla();
        turnoDia.setId(1L);
        turnoDia.setEsNocturno(false);
        turnoDia.setNombre("Turno Dia");

        turnoNoche = new TurnoPlantilla();
        turnoNoche.setId(2L);
        turnoNoche.setEsNocturno(true);
        turnoNoche.setNombre("Turno Noche");
    }

    @Test
    void procesarMarcacion_TurnoDia_Entrada() {
        // Arrange
        LocalDate fecha = LocalDate.of(2023, 10, 10);
        LocalDateTime entrada = LocalDateTime.of(fecha, LocalTime.of(8, 0)); // 08:00

        MarcacionEvento evento = crearEvento(empleado, entrada, MarcacionEvento.TipoEvento.ENTRADA);

        AsignacionTurno asignacion = new AsignacionTurno();
        asignacion.setTurnoPlantilla(turnoDia);

        when(asignacionTurnoRepository.findVigentesPorEmpleado(eq(1L), eq(fecha)))
                .thenReturn(List.of(asignacion));

        when(asistenciaRepository.findByEmpleadoIdAndFechaLaboral(eq(1L), eq(fecha)))
                .thenReturn(Optional.empty());

        // Act
        motorService.procesarMarcacion(evento);

        // Assert
        ArgumentCaptor<AsistenciaDia> captor = ArgumentCaptor.forClass(AsistenciaDia.class);
        verify(asistenciaRepository).save(captor.capture());

        AsistenciaDia guardado = captor.getValue();
        assertEquals(fecha, guardado.getFechaLaboral());
        assertEquals(entrada, guardado.getHoraEntradaReal());
    }

    @Test
    void procesarMarcacion_TurnoNoche_SalidaDiaSiguiente() {
        // Arrange
        LocalDate fechaInicio = LocalDate.of(2023, 10, 10);
        LocalDate fechaFin = LocalDate.of(2023, 10, 11);
        LocalDateTime salida = LocalDateTime.of(fechaFin, LocalTime.of(6, 0)); // 06:00 del día siguiente

        MarcacionEvento evento = crearEvento(empleado, salida, MarcacionEvento.TipoEvento.SALIDA);

        AsignacionTurno asignacion = new AsignacionTurno();
        asignacion.setTurnoPlantilla(turnoNoche); // Turno noche

        // Simulamos que el sistema busca asignaciones para el día 11 (día del evento)
        // pero DEBERÍA asignar la asistencia al día 10 (fecha laboral)
        when(asignacionTurnoRepository.findVigentesPorEmpleado(any(), any()))
                .thenReturn(List.of(asignacion));

        // Simulamos que ya existe la asistencia creada por la entrada del día 10
        AsistenciaDia asistenciaExistente = new AsistenciaDia();
        asistenciaExistente.setFechaLaboral(fechaInicio);
        asistenciaExistente.setEmpleado(empleado);
        asistenciaExistente.setHoraEntradaReal(LocalDateTime.of(fechaInicio, LocalTime.of(22, 0)));

        when(asistenciaRepository.findByEmpleadoIdAndFechaLaboral(eq(1L), eq(fechaInicio)))
                .thenReturn(Optional.of(asistenciaExistente));

        // Act
        motorService.procesarMarcacion(evento);

        // Assert
        ArgumentCaptor<AsistenciaDia> captor = ArgumentCaptor.forClass(AsistenciaDia.class);
        verify(asistenciaRepository).save(captor.capture());

        AsistenciaDia guardado = captor.getValue();
        assertEquals(fechaInicio, guardado.getFechaLaboral()); // Debe mantenerse en el dia 10
        assertEquals(salida, guardado.getHoraSalidaReal());
        assertEquals(AsistenciaDia.EstadoAsistencia.NORMAL, guardado.getEstadoAsistencia());
        assertTrue(guardado.getMinsTrabajadosReales() > 0);
    }

    private MarcacionEvento crearEvento(Empleado emp, LocalDateTime ts, MarcacionEvento.TipoEvento tipo) {
        MarcacionEvento ev = new MarcacionEvento();
        ev.setUuid("uuid-123");
        ev.setEmpleado(emp);
        ev.setTimestampEvento(ts);
        ev.setTipoEvento(tipo);
        return ev;
    }
}
