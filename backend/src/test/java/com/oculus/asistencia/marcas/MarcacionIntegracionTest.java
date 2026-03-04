package com.oculus.asistencia.marcas;

import com.oculus.asistencia.marcas.controller.MarcacionController.MarcacionDto;
import com.oculus.asistencia.marcas.model.MarcacionEvento;
import com.oculus.asistencia.marcas.model.MarcacionIntento;
import com.oculus.asistencia.marcas.repository.MarcacionEventoRepository;
import com.oculus.asistencia.marcas.repository.MarcacionIntentoRepository;
import com.oculus.asistencia.rrhh.model.Empleado;
import com.oculus.asistencia.rrhh.repository.EmpleadoRepository;
import com.oculus.asistencia.biometria.service.BiometriaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class MarcacionIntegracionTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private EmpleadoRepository empleadoRepository;

        @Autowired
        private MarcacionEventoRepository marcacionRepository;

        @Autowired
        private MarcacionIntentoRepository intentoRepository;

        @MockBean
        private BiometriaService biometriaService;

        private Empleado empleadoTest;

        @BeforeEach
        void setUp() {
                empleadoTest = new Empleado();
                empleadoTest.setNombreCompleto("Empleado Test");
                empleadoTest.setNumeroDocumento("12345678");
                empleadoTest.setCodigoEmpleado("EM-001");
                empleadoRepository.save(empleadoTest);
        }

        @Test
        void testMarcacionExitosa_DebeRegistrarEventoEIntento() throws Exception {
                String uuid = UUID.randomUUID().toString();
                MarcacionDto dto = new MarcacionDto(uuid, empleadoTest.getId(), LocalDateTime.now(),
                                MarcacionEvento.TipoEvento.ENTRADA, "FACIAL");

                when(biometriaService.verificarLiveness(any())).thenReturn(true);

                mockMvc.perform(post("/api/marcaciones/registrar")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isOk());

                // Verificar Evento
                assertTrue(marcacionRepository.existsById(uuid));

                // Verificar Auditoría
                List<MarcacionIntento> intentos = intentoRepository.findAll();
                MarcacionIntento intento = intentos.stream()
                                .filter(i -> uuid.equals(i.getUuid()))
                                .findFirst().orElseThrow();

                assertTrue(intento.isExito());
                assertNull(intento.getErrorMotivo());
        }

        @Test
        void testFalloLiveness_DebeRegistrarErrorEnAuditoria() throws Exception {
                String uuid = UUID.randomUUID().toString();
                MarcacionDto dto = new MarcacionDto(uuid, empleadoTest.getId(), LocalDateTime.now(),
                                MarcacionEvento.TipoEvento.ENTRADA, "FACIAL");

                when(biometriaService.verificarLiveness(any())).thenReturn(false);

                mockMvc.perform(post("/api/marcaciones/registrar")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isBadRequest());

                // No debe existir evento
                assertFalse(marcacionRepository.existsById(uuid));

                // Debe existir auditoría con error
                MarcacionIntento intento = intentoRepository.findAll().stream()
                                .filter(i -> uuid.equals(i.getUuid()))
                                .findFirst().orElseThrow();

                assertFalse(intento.isExito());
                assertEquals("Falla de validación biométrica (Liveness)", intento.getErrorMotivo());
        }

        @Test
        void testEmpleadoNoEncontrado_DebeRegistrarErrorEnAuditoria() throws Exception {
                String uuid = UUID.randomUUID().toString();
                MarcacionDto dto = new MarcacionDto(uuid, 9999L, LocalDateTime.now(),
                                MarcacionEvento.TipoEvento.ENTRADA,
                                "PIN");

                mockMvc.perform(post("/api/marcaciones/registrar")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isBadRequest());

                MarcacionIntento intento = intentoRepository.findAll().stream()
                                .filter(i -> uuid.equals(i.getUuid()))
                                .findFirst().orElseThrow();

                assertFalse(intento.isExito());
                assertEquals("Empleado no encontrado", intento.getErrorMotivo());
        }

        @Test
        void testFlujoCompleto_EntradaYSalida_DebeRegistrarTodo() throws Exception {
                // 1. Entrada
                String uuidEntrada = UUID.randomUUID().toString();
                MarcacionDto dtoEntrada = new MarcacionDto(uuidEntrada, empleadoTest.getId(),
                                LocalDateTime.now().minusHours(8), MarcacionEvento.TipoEvento.ENTRADA, "PIN");

                mockMvc.perform(post("/api/marcaciones/registrar")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dtoEntrada)))
                                .andExpect(status().isOk());

                // 2. Salida
                String uuidSalida = UUID.randomUUID().toString();
                MarcacionDto dtoSalida = new MarcacionDto(uuidSalida, empleadoTest.getId(), LocalDateTime.now(),
                                MarcacionEvento.TipoEvento.SALIDA, "PIN");

                mockMvc.perform(post("/api/marcaciones/registrar")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dtoSalida)))
                                .andExpect(status().isOk());

                // Verificaciones
                assertEquals(2, marcacionRepository.findAll().stream()
                                .filter(e -> e.getEmpleado().getId().equals(empleadoTest.getId())).count());
                assertEquals(2, intentoRepository.findAll().stream()
                                .filter(i -> i.getEmpleadoIdRaw().equals(empleadoTest.getId())).count());
        }

        @Test
        void testIdempotencia_DebeIgnorarDuplicados() throws Exception {
                String uuid = UUID.randomUUID().toString();
                MarcacionDto dto = new MarcacionDto(uuid, empleadoTest.getId(), LocalDateTime.now(),
                                MarcacionEvento.TipoEvento.ENTRADA, "PIN");

                // Primera vez
                mockMvc.perform(post("/api/marcaciones/registrar")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isOk());

                // Segunda vez
                mockMvc.perform(post("/api/marcaciones/registrar")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isOk());

                // Verificar que solo hay 1 evento pero pueden haber 2 auditorías (o 1 marcada
                // como duplicada)
                long eventosCount = marcacionRepository.findAll().stream().filter(e -> e.getUuid().equals(uuid))
                                .count();
                assertEquals(1, eventosCount);

                List<MarcacionIntento> intentos = intentoRepository.findAll().stream()
                                .filter(i -> uuid.equals(i.getUuid()))
                                .toList();

                assertTrue(intentos.size() >= 2);
                assertTrue(intentos.get(1).getErrorMotivo().contains("duplicado"));
        }
}
