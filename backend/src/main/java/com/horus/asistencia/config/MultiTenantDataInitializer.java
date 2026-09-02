package com.horus.asistencia.config;

import com.horus.asistencia.organizacion.model.Empresa;
import com.horus.asistencia.organizacion.model.Sede;
import com.horus.asistencia.organizacion.repository.EmpresaRepository;
import com.horus.asistencia.organizacion.repository.SedeRepository;
import com.horus.asistencia.rrhh.model.Empleado;
import com.horus.asistencia.rrhh.repository.EmpleadoRepository;
import com.horus.asistencia.identidad.model.Usuario;
import com.horus.asistencia.identidad.repository.UsuarioRepository;
import com.horus.asistencia.marcas.repository.MarcacionEventoRepository;
import com.horus.asistencia.turnos.repository.AsignacionTurnoRepository;
import com.horus.asistencia.turnos.repository.TurnoPlantillaRepository;
import com.horus.asistencia.motor.repository.AsistenciaDiaRepository;
import com.horus.asistencia.biometria.repository.PerfilBiometricoRepository;
import com.horus.asistencia.organizacion.repository.DispositivoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class MultiTenantDataInitializer implements CommandLineRunner {

    private final EmpresaRepository empresaRepository;
    private final SedeRepository sedeRepository;
    private final EmpleadoRepository empleadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final DispositivoRepository dispositivoRepository;
    private final TurnoPlantillaRepository turnoPlantillaRepository;
    private final MarcacionEventoRepository marcacionEventoRepository;
    private final AsistenciaDiaRepository asistenciaDiaRepository;
    private final PerfilBiometricoRepository perfilBiometricoRepository;
    private final AsignacionTurnoRepository asignacionTurnoRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (empresaRepository.count() == 0) {
            log.info("Iniciando migración multi-tenant: Creando empresa por defecto...");
            
            Empresa defaultEmpresa = new Empresa();
            defaultEmpresa.setNombre("Horus Default Enterprise");
            defaultEmpresa.setIdentificacionFiscal("00000000-0");
            defaultEmpresa = empresaRepository.save(defaultEmpresa);

            // Migración de datos huérfanos
            final Empresa empresa = defaultEmpresa;
            
            log.info("Asignando sedes huérfanas...");
            List<Sede> sedes = sedeRepository.findAll();
            sedes.stream().filter(s -> s.getEmpresa() == null).forEach(s -> {
                s.setEmpresa(empresa);
                sedeRepository.save(s);
            });

            log.info("Asignando empleados huérfanos...");
            List<Empleado> empleados = empleadoRepository.findAll();
            empleados.stream().filter(e -> e.getEmpresa() == null).forEach(e -> {
                e.setEmpresa(empresa);
                empleadoRepository.save(e);
            });

            log.info("Asignando usuarios huérfanos...");
            List<Usuario> usuarios = usuarioRepository.findAll();
            usuarios.stream().filter(u -> u.getEmpresa() == null).forEach(u -> {
                u.setEmpresa(empresa);
                usuarioRepository.save(u);
            });

            // Nuevas entidades
            log.info("Asignando dispositivos huérfanos...");
            dispositivoRepository.findAll().stream().filter(d -> d.getEmpresa() == null).forEach(d -> {
                d.setEmpresa(empresa);
                dispositivoRepository.save(d);
            });

            log.info("Asignando plantillas de turnos huérfanas...");
            turnoPlantillaRepository.findAll().stream().filter(t -> t.getEmpresa() == null).forEach(t -> {
                t.setEmpresa(empresa);
                turnoPlantillaRepository.save(t);
            });

            log.info("Asignando marcaciones huérfanas...");
            marcacionEventoRepository.findAll().stream().filter(m -> m.getEmpresa() == null).forEach(m -> {
                m.setEmpresa(empresa);
                marcacionEventoRepository.save(m);
            });

            log.info("Asignando asistencias procesadas huérfanas...");
            asistenciaDiaRepository.findAll().stream().filter(a -> a.getEmpresa() == null).forEach(a -> {
                a.setEmpresa(empresa);
                asistenciaDiaRepository.save(a);
            });

            log.info("Asignando perfiles biométricos huérfanos...");
            perfilBiometricoRepository.findAll().stream().filter(p -> p.getEmpresa() == null).forEach(p -> {
                p.setEmpresa(empresa);
                perfilBiometricoRepository.save(p);
            });

            log.info("Asignando asignaciones de turnos huérfanas...");
            asignacionTurnoRepository.findAll().stream().filter(at -> at.getEmpresa() == null).forEach(at -> {
                at.setEmpresa(empresa);
                asignacionTurnoRepository.save(at);
            });

            log.info("Migración multi-tenant completada exitosamente.");
        }
    }
}
