package com.horus.asistencia.motor.service;

import com.horus.asistencia.motor.model.ReglaAsistencia;
import com.horus.asistencia.motor.repository.ReglaAsistenciaRepository;
import com.horus.asistencia.rrhh.model.Empleado;
import com.horus.asistencia.turnos.model.TurnoPlantilla;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConfiguracionMotorService {

    private final ReglaAsistenciaRepository reglaRepository;

    /**
     * Resuelve la regla de asistencia aplicable con jerarquía:
     * Empleado > Turno > Sede > Global
     */
    public ReglaAsistencia resolverRegla(Empleado empleado, TurnoPlantilla turno, Long sedeId) {
        // 1. Empleado
        Optional<ReglaAsistencia> reg = reglaRepository.findByNivelAlcanceAndEntidadIdAndActivoTrue(
                ReglaAsistencia.NivelAlcance.EMPLEADO, empleado.getId());
        if (reg.isPresent())
            return reg.get();

        // 2. Turno
        if (turno != null) {
            reg = reglaRepository.findByNivelAlcanceAndEntidadIdAndActivoTrue(
                    ReglaAsistencia.NivelAlcance.TURNO, turno.getId());
            if (reg.isPresent())
                return reg.get();
        }

        // 3. Sede
        if (sedeId != null) {
            reg = reglaRepository.findByNivelAlcanceAndEntidadIdAndActivoTrue(
                    ReglaAsistencia.NivelAlcance.SEDE, sedeId);
            if (reg.isPresent())
                return reg.get();
        }

        // 4. Global
        return reglaRepository.findFirstByNivelAlcanceAndActivoTrue(ReglaAsistencia.NivelAlcance.GLOBAL)
                .orElseGet(this::crearReglaDefault);
    }

    private ReglaAsistencia crearReglaDefault() {
        ReglaAsistencia r = new ReglaAsistencia();
        r.setNombre("DEFAULT FALLBACK");
        r.setNivelAlcance(ReglaAsistencia.NivelAlcance.GLOBAL);
        r.setToleranciaEntrada(0);
        return r;
    }
}
