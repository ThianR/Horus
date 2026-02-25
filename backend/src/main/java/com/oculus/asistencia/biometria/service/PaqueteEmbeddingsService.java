package com.oculus.asistencia.biometria.service;

import com.oculus.asistencia.biometria.model.PaqueteEmbeddings;
import com.oculus.asistencia.biometria.model.PerfilBiometrico;
import com.oculus.asistencia.biometria.repository.PaqueteEmbeddingsRepository;
import com.oculus.asistencia.biometria.repository.PerfilBiometricoRepository;
import com.oculus.asistencia.organizacion.model.Sede;
import com.oculus.asistencia.organizacion.repository.SedeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.ByteBuffer;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaqueteEmbeddingsService {

    private final PerfilBiometricoRepository perfilRepository;
    private final PaqueteEmbeddingsRepository paqueteRepository;
    private final SedeRepository sedeRepository;

    /**
     * Genera un paquete binario con todos los embeddings de una sede.
     * Formato: [ID (8 bytes)][Longitud (4 bytes)][Data (N bytes)]...
     */
    public byte[] generarPaqueteParaSede(Long sedeId) {
        log.info("Generando paquete de embeddings para sede ID: {}", sedeId);

        // En un MVP, tomamos todos los perfiles activos
        List<PerfilBiometrico> perfiles = perfilRepository.findAll();

        // Calcular tamaño: (Long ID + Int Len + FloatArray) * N
        // Asumiendo 128 floats (512 bytes) + 8 + 4 = 524 bytes por perfil
        int size = perfiles.size() * 524;
        ByteBuffer buffer = ByteBuffer.allocate(size);

        for (PerfilBiometrico p : perfiles) {
            buffer.putLong(p.getEmpleado().getId());
            byte[] emb = p.getEmbedding();
            buffer.putInt(emb.length);
            buffer.put(emb);
        }

        // Registrar el paquete en la DB
        PaqueteEmbeddings pkg = new PaqueteEmbeddings();
        Optional<Sede> sede = sedeRepository.findById(sedeId);
        sede.ifPresent(pkg::setSede);

        long version = paqueteRepository.findTopBySedeIdOrderByVersionDesc(sedeId)
                .map(p -> p.getVersion() + 1)
                .orElse(1L);

        pkg.setVersion(version);
        paqueteRepository.save(pkg);

        return buffer.array();
    }
}
