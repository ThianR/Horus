package com.oculus.asistencia.reportes.service;

import com.oculus.asistencia.organizacion.model.Sede;
import com.oculus.asistencia.organizacion.model.Empresa;
import com.oculus.asistencia.organizacion.repository.SedeRepository;
import com.oculus.asistencia.rrhh.model.Empleado;
import com.oculus.asistencia.rrhh.model.EmpleadoSedeHabilitada;
import com.oculus.asistencia.rrhh.repository.EmpleadoRepository;
import com.oculus.asistencia.rrhh.repository.EmpleadoSedeHabilitadaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImportacionMasivaService {

    private final EmpleadoRepository empleadoRepository;
    private final SedeRepository sedeRepository;
    private final EmpleadoSedeHabilitadaRepository empleadoSedeRepo;
    private final com.oculus.asistencia.identidad.repository.UsuarioRepository usuarioRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private final com.oculus.asistencia.organizacion.repository.EmpresaRepository empresaRepository;

    @Transactional
    public com.oculus.asistencia.rrhh.dto.ImportacionResultDto importarEmpleadosYSedes(InputStream inputStream) {
        com.oculus.asistencia.rrhh.dto.ImportacionResultDto result = new com.oculus.asistencia.rrhh.dto.ImportacionResultDto();

        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);

            // Iteramos desde la fila 1 (asumiendo que la fila 0 es cabecera)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                try {
                    String identificacionEmpresa = getStringValue(row.getCell(0));
                    String codigoEmpleado = getStringValue(row.getCell(1));
                    String numeroDocumento = getStringValue(row.getCell(2));
                    String nombreCompleto = getStringValue(row.getCell(3));
                    String email = getStringValue(row.getCell(4));
                    String codigoSede = getStringValue(row.getCell(5));
                    String nombreSede = getStringValue(row.getCell(6));

                    // Validar obligatorios
                    if (identificacionEmpresa.isEmpty() || codigoEmpleado.isEmpty() || nombreCompleto.isEmpty() || codigoSede.isEmpty()) {
                        String errorMsg = String.format("Fila %d ignorada por falta de datos obligatorios (código empresa, empleado, nombre o código sede)", i + 1);
                        log.warn(errorMsg);
                        result.addError(errorMsg);
                        continue;
                    }

                    // 0. Buscar la empresa
                    Optional<Empresa> empresaOpt = empresaRepository.findByIdentificacionFiscal(identificacionEmpresa);
                    if (empresaOpt.isEmpty()) {
                        String errorMsg = String.format("Fila %d falló: Empresa con identificación '%s' no encontrada en el sistema.", i + 1, identificacionEmpresa);
                        log.error(errorMsg);
                        result.addError(errorMsg);
                        continue;
                    }
                    Empresa empresa = empresaOpt.get();

                    // 1. Obtener o Crear Sede usando estrictamente el Código de Sede
                    Sede sede = sedeRepository.findByCodigoExternoAndEmpresaId(codigoSede, empresa.getId())
                            .orElseGet(() -> {
                                String paramNombreSede = nombreSede.isEmpty() ? "Sede " + codigoSede : nombreSede;
                                log.info("Sede no encontrada, creando nueva: {} con código {} en empresa {}", paramNombreSede, codigoSede, empresa.getNombre());
                                Sede nuevaSede = new Sede();
                                nuevaSede.setNombre(paramNombreSede);
                                nuevaSede.setCodigoExterno(codigoSede);
                                nuevaSede.setDireccion("Dirección Pendiente");
                                nuevaSede.setEmpresa(empresa);
                                return sedeRepository.save(nuevaSede);
                            });

                    // Si se proveyó un nuevo nombre de sede, podemos actualizar el registro de la sede
                    if (!nombreSede.isEmpty() && !nombreSede.equals(sede.getNombre())) {
                        log.info("Actualizando nombre para sede código {}: {}", codigoSede, nombreSede);
                        sede.setNombre(nombreSede);
                        sede = sedeRepository.save(sede);
                    }

                    // 2. Obtener o Crear Empleado (Upsert)
                    Optional<Empleado> empByCodigo = empleadoRepository.findByCodigoEmpleadoAndEmpresaId(codigoEmpleado, empresa.getId());
                    Empleado empleado;

                    if (empByCodigo.isPresent()) {
                        empleado = empByCodigo.get();
                        // Actualizar datos básicos (Upsert)
                        empleado.setNombreCompleto(nombreCompleto);
                        if (!email.isEmpty())
                            empleado.setEmail(email);
                        if (!numeroDocumento.isEmpty())
                            empleado.setNumeroDocumento(numeroDocumento);
                    } else {
                        // Crear nuevo empleado
                        empleado = new Empleado();
                        empleado.setCodigoEmpleado(codigoEmpleado);
                        empleado.setNumeroDocumento(numeroDocumento.isEmpty() ? codigoEmpleado : numeroDocumento);
                        empleado.setNombreCompleto(nombreCompleto);
                        empleado.setEmail(email.isEmpty() ? codigoEmpleado + "@oculus.local" : email);
                        empleado.setEstado(Empleado.EstadoEmpleado.ACTIVO);
                        empleado.setBiometriaRegistrada(false);
                        empleado.setEmpresa(empresa);
                        
                        String username = empleado.getNumeroDocumento();
                        if (usuarioRepository.findByUsername(username).isEmpty()) {
                            com.oculus.asistencia.identidad.model.Usuario nuevoUsuario = new com.oculus.asistencia.identidad.model.Usuario();
                            nuevoUsuario.setEmpresa(empresa);
                            nuevoUsuario.setUsername(username);
                            nuevoUsuario.setPasswordHash(passwordEncoder.encode(username));
                            nuevoUsuario.setRol(com.oculus.asistencia.identidad.model.Usuario.Rol.EMPLEADO);
                            nuevoUsuario.setActivo(true);
                            nuevoUsuario.setTourCompletado(false);
                            usuarioRepository.save(nuevoUsuario);
                            empleado.setUsuario(nuevoUsuario);
                        }
                    }

                    // Validar unicidad global del documento si el estado va/es a ser ACTIVO
                    if (empleado.getEstado() != null && empleado.getEstado() == Empleado.EstadoEmpleado.ACTIVO) {
                        Optional<Empleado> empActivo = empleadoRepository.findByNumeroDocumentoAndEstado(empleado.getNumeroDocumento(), Empleado.EstadoEmpleado.ACTIVO);
                        if (empActivo.isPresent() && (empleado.getId() == null || !empActivo.get().getId().equals(empleado.getId()))) {
                            String errMsg = String.format("Fila %d falló: El documento %s ya se encuentra activo en otra empresa (%s).", 
                                i + 1, empleado.getNumeroDocumento(), empActivo.get().getEmpresa().getNombre());
                            log.error(errMsg);
                            result.addError(errMsg);
                            continue;
                        }
                    }

                    empleado = empleadoRepository.save(empleado);

                    // 3. Obtener o Crear Asignación de Sede Activa
                    Optional<EmpleadoSedeHabilitada> habilitacionOpt = empleadoSedeRepo
                            .findFirstByEmpleadoIdAndActivoTrue(empleado.getId());

                    if (habilitacionOpt.isEmpty() || !habilitacionOpt.get().getSede().getId().equals(sede.getId())) {
                        log.info("Actualizando asignación de sede para empleado {}", empleado.getCodigoEmpleado());

                        if (habilitacionOpt.isPresent()) {
                            EmpleadoSedeHabilitada prev = habilitacionOpt.get();
                            prev.setActivo(false);
                            prev.setFechaHasta(LocalDate.now());
                            empleadoSedeRepo.save(prev);
                        }

                        EmpleadoSedeHabilitada nuevaHabilitacion = new EmpleadoSedeHabilitada();
                        nuevaHabilitacion.setEmpleado(empleado);
                        nuevaHabilitacion.setSede(sede);
                        nuevaHabilitacion.setFechaDesde(LocalDate.now());
                        nuevaHabilitacion.setActivo(true);
                        empleadoSedeRepo.save(nuevaHabilitacion);
                    }

                    result.incrementProcesados();
                } catch (Exception e) {
                    String errorMsg = String.format("Fila %d error general: %s", i + 1, e.getMessage());
                    log.error(errorMsg);
                    result.addError(errorMsg);
                }
            }
        } catch (Exception e) {
            log.error("Error masivo de importación: ", e);
            throw new RuntimeException("Error leyendo formato Excel", e);
        }
        return result;
    }

    private String getStringValue(Cell cell) {
        if (cell == null)
            return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                // Si el DNI o Código es detectado como numérico, lo convertimos a int/long
                // string sin decimales
                return String.valueOf(Double.valueOf(cell.getNumericCellValue()).longValue());
            default:
                return "";
        }
    }
}
