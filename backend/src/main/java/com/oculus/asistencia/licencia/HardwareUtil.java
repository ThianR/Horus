package com.oculus.asistencia.licencia;

import lombok.extern.slf4j.Slf4j;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.security.MessageDigest;

@Slf4j
public class HardwareUtil {

    public static String getHardwareId() {
        try {
            String os = System.getProperty("os.name").toLowerCase();
            String rawId = "";

            if (os.contains("win")) {
                String cpuId = getCommandOutput("wmic cpu get processorid");
                String boardId = getCommandOutput("wmic baseboard get serialnumber");
                rawId = cpuId.replaceAll("\\s+", "") + "-" + boardId.replaceAll("\\s+", "");
            } else if (os.contains("nix") || os.contains("nux") || os.contains("mac")) {
                // Para Linux/Mac leemos el machine-id o product_uuid
                String machineId = getCommandOutput("cat /etc/machine-id");
                if (machineId == null || machineId.trim().isEmpty()) {
                    machineId = getCommandOutput("cat /var/lib/dbus/machine-id");
                }
                rawId = machineId != null ? machineId.replaceAll("\\s+", "") : "UNKNOWN-LINUX-NODE";
            } else {
                rawId = "UNKNOWN-OS-" + System.currentTimeMillis();
            }

            return "OC-HW-" + hashSHA256(rawId).substring(0, 16).toUpperCase();
        } catch (Exception e) {
            log.error("Error generando Hardware ID", e);
            // Fallback en caso de error extremo
            return "OC-HW-FALLBACK-001";
        }
    }

    private static String getCommandOutput(String command) throws Exception {
        Process process = Runtime.getRuntime().exec(command);
        process.getOutputStream().close();
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            StringBuilder output = new StringBuilder();
            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (firstLine) {
                    firstLine = false; // Skip the header (e.g. "ProcessorId")
                    continue;
                }
                output.append(line.trim());
            }
            return output.toString();
        }
    }

    private static String hashSHA256(String base) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(base.getBytes("UTF-8"));
        StringBuilder hexString = new StringBuilder();

        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
