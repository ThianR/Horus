import urllib.request
import json
import sys

def fetch():
    try:
        url = "http://localhost:8000/api/dispositivos?empresaId=1"
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            print(f"DEBUG: Total dispositivos JSON: {len(data)}")
            for d in data:
                # Imprimir cada uno en su propia linea limpia
                info = f"DISP_ID: {d.get('id')} | NAME: {d.get('nombre')} | UUID: {d.get('uuidHardware')} | STATUS: {d.get('estado')}"
                print(info)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    print("--- INICIO LISTADO ---")
    fetch()
    print("--- FIN LISTADO ---")
