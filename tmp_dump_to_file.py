import urllib.request
import json
import sys

def fetch():
    try:
        url = "http://localhost:8000/api/dispositivos?empresaId=1"
        with urllib.request.urlopen(url) as response:
            content = response.read().decode()
            # Guardar el JSON crudo en un archivo para leerlo sin truncado de consola
            with open("d:/Personales/SISTEMAS/oculus/dispositivos_dump.json", "w") as f:
                f.write(content)
            
            data = json.loads(content)
            print(f"DEBUG: JSON guardado en dispositivos_dump.json con {len(data)} elementos.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    fetch()
