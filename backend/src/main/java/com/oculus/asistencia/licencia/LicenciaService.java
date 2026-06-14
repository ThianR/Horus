package com.oculus.asistencia.licencia;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Date;

@Service
@Slf4j
public class LicenciaService {

    // Llave maestra del software (Hardcodeada o en variables de entorno, idealmente muy segura)
    // Para propósitos de esta implementación, usaremos una llave fuerte fija.
    private static final String MASTER_SECRET = "OculusMasterKeyForLicensing2026!VerySecureAndLongString";
    private SecretKey key;
    
    private final String LICENCIA_PATH = "oculus.lic"; // Archivo en la raíz del proyecto

    @Getter
    private boolean licenciaValida = false;
    
    @Getter
    private String mensajeError = "Licencia no encontrada";

    @Getter
    private String hardwareIdActual;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(MASTER_SECRET.getBytes());
        this.hardwareIdActual = HardwareUtil.getHardwareId();
        log.info("=== OCULUS HARDWARE ID: {} ===", hardwareIdActual);
        validarLicenciaActual();
    }

    public void validarLicenciaActual() {
        File licFile = new File(LICENCIA_PATH);
        if (!licFile.exists()) {
            licenciaValida = false;
            mensajeError = "No se encontró el archivo de licencia (oculus.lic)";
            log.error(mensajeError);
            return;
        }

        try {
            String token = new String(Files.readAllBytes(Paths.get(LICENCIA_PATH))).trim();
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String licensedHwid = claims.get("hwid", String.class);
            Date expiration = claims.getExpiration();

            if (!hardwareIdActual.equals(licensedHwid)) {
                licenciaValida = false;
                mensajeError = "La licencia no pertenece a este servidor (HWID Mismatch)";
                log.error(mensajeError);
                return;
            }

            if (expiration.before(new Date())) {
                licenciaValida = false;
                mensajeError = "La licencia ha expirado";
                log.error(mensajeError);
                return;
            }

            licenciaValida = true;
            mensajeError = "";
            log.info("=== Licencia Válida. Cliente: {} ===", claims.get("cliente", String.class));

        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            licenciaValida = false;
            mensajeError = "La licencia ha expirado";
            log.error(mensajeError);
        } catch (Exception e) {
            licenciaValida = false;
            mensajeError = "Archivo de licencia corrupto o inválido";
            log.error(mensajeError, e);
        }
    }

    public boolean guardarNuevaLicencia(String token) {
        try {
            // Test if it's a valid token before saving
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            
            Files.write(Paths.get(LICENCIA_PATH), token.getBytes());
            validarLicenciaActual();
            return licenciaValida;
        } catch (Exception e) {
            log.error("Intentando guardar licencia inválida", e);
            return false;
        }
    }
}
