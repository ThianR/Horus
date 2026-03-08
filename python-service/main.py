import os
import sys

# Forzar el uso de Keras legado para compatibilidad con librerías como MTCNN en TF 2.16+
os.environ['TF_USE_LEGACY_KERAS'] = '1'

import tensorflow as tf
try:
    import tf_keras as keras
    sys.modules['keras'] = keras
    tf.keras = keras
except ImportError:
    pass

import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deepface import DeepFace
import cv2
import numpy as np

app = FastAPI(title="Oculus Biometria API", version="1.0.0")

# Permitir CORS para desarrollo local (Frontend Vite / Backend Spring Boot)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Definir el modelo a usar
MODEL_NAME = "ArcFace"
DETECTOR_BACKEND = "retinaface" # Mucho más preciso que opencv para alineación

class VerifyRequest(BaseModel):
    img1_path: str
    img2_path: str

@app.on_event("startup")
async def startup_event():
    print(f"[*] Inicializando Motor Biométrico con modelo: {MODEL_NAME}")
    # Forzar la descarga/carga del modelo en memoria en el arranque
    try:
        DeepFace.build_model(MODEL_NAME)
        print("[*] Modelo cargado exitosamente.")
    except Exception as e:
        print(f"[!] Error precargando el modelo: {str(e)}")

def file_to_cv2(file_bytes: bytes):
    np_arr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return img

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "biometria", "model": MODEL_NAME}

@app.post("/api/v1/extract")
async def extract_embedding(file: UploadFile = File(...)):
    """
    Recibe una imagen (UploadFile) y devuelve:
    - embedding (Float[512] para ArcFace)
    - face_confidence (Confianza de que es un rostro)
    - region (Coordenadas del rostro en la imagen)
    """
    try:
        contents = await file.read()
        img = file_to_cv2(contents)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Imagen no válida o corrupta.")

        # Obtener embeddings (DeepFace maneja deteccion y alineacion automaticamente)
        # enforce_detection=True obliga a fallar si no hay rostro
        results = DeepFace.represent(
            img_path=img,
            model_name=MODEL_NAME,
            detector_backend=DETECTOR_BACKEND,
            enforce_detection=True,
            align=True
        )

        if len(results) == 0:
            raise HTTPException(status_code=400, detail="Rostro no detectado.")
        
        if len(results) > 1:
            raise HTTPException(status_code=400, detail="Se detectó más de un rostro en la imagen. Solo debe haber uno.")

        face_data = results[0]
        embedding = np.array(face_data["embedding"])
        
        # Normalización L2 manual para asegurar consistencia
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
        
        # Log para depuración
        print(f"[*] Face detected. Confidence: {face_data.get('face_confidence', 'N/A')}")
        print(f"[*] Embedding calculated. Dim: {len(embedding)}, Norm: {norm:.4f}, Primeros 5: {embedding[:5].tolist()}")
        
        return {
            "embedding": embedding.tolist(),
            "face_confidence": face_data.get("face_confidence", 1.0),
            "bbox": face_data["facial_area"]
        }

    except ValueError as ve:
         # DeepFace lanza ValueError cuando enforce_detection=True y no halla rostro
         raise HTTPException(status_code=400, detail=f"Error en detección de rostro: {str(ve)}")
    except Exception as e:
        print(f"Error procesando imagen: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/verify")
async def verify_faces(
    source_image: UploadFile = File(...),
    target_image: UploadFile = File(...)
):
    """
    Recibe dos imagenes y calcula si son la misma persona.
    (Util para Kiosco offline o testing nativo Python)
    """
    try:
        src_bytes = await source_image.read()
        tgt_bytes = await target_image.read()
        
        src_img = file_to_cv2(src_bytes)
        tgt_img = file_to_cv2(tgt_bytes)

        result = DeepFace.verify(
            img1_path=src_img,
            img2_path=tgt_img,
            model_name=MODEL_NAME,
            detector_backend=DETECTOR_BACKEND,
            enforce_detection=True,
            align=True
        )

        return {
            "verified": result["verified"],
            "distance": result["distance"],
            "threshold": result["threshold"],
            "metric": result["distance_metric"]
        }
    except ValueError as ve:
         raise HTTPException(status_code=400, detail=f"Rostro no detectado en alguna imagen: {str(ve)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
