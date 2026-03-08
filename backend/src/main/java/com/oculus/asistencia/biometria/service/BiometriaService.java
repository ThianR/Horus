package com.oculus.asistencia.biometria.service;

import java.util.List;

/**
 * Interfaz para el servicio de biometría.
 * Permite la abstracción de la librería de reconocimiento facial (ej.
 * InsightFace, OpenCV).
 */
public interface BiometriaService {

    /**
     * Extrae el vector de características (embedding) de una imagen de rostro.
     * 
     * @param imagenBytes Contenido de la imagen en bytes.
     * @return Arreglo de floats representando el embedding.
     */
    float[] extraerEmbedding(byte[] imagenBytes);

    /**
     * Compara dos embeddings y devuelve la distancia/similitud.
     * 
     * @param embedding1 Primer vector.
     * @param embedding2 Segundo vector.
     * @return Valor de similitud (usualmente 0.0 a 1.0).
     */
    double compararEmbeddings(float[] embedding1, float[] embedding2);

    /**
     * Realiza la detección de liveness (vida) en la imagen.
     * 
     * @param imagenBytes Contenido de la imagen.
     * @return True si se detecta una persona real, False si es una foto/pantalla.
     */
    boolean verificarLiveness(byte[] imagenBytes);

    /**
     * Valida la calidad de la imagen para asegurar un buen
     * enrolamiento/reconocimiento.
     * 
     * @param imagenBytes Contenido de la imagen.
     * @return Resultado con puntaje de calidad y mensajes.
     */
    ResultadoValidacion validarCalidadImagen(byte[] imagenBytes);

    /**
     * Busca el rostro más cercano en una lista de candidatos.
     * 
     * @param objetivo   Embedding a buscar.
     * @param candidatos Lista de perfiles conocidos.
     * @return ID del empleado identificado o null.
     */
    Long identificarEmpleado(float[] objetivo, List<PerfilCandidato> candidatos);

    record PerfilCandidato(Long empleadoId, float[] embedding) {
    }

    record ResultadoValidacion(boolean esValida, double calidad, String mensaje) {
    }
}
