import urllib.request
import json

try:
    with urllib.request.urlopen("http://localhost:8000/api/dispositivos?empresaId=1") as response:
        if response.status == 200:
            data = json.loads(response.read().decode())
            print(f"Total dispositivos: {len(data)}")
            for d in data:
                print(f"ID: {d.get('id')} | Nombre: {d.get('nombre')} | UUID: {d.get('uuidHardware')} | Estado: {d.get('estado')} | Sede: {d.get('sede', {}).get('nombre')}")
        else:
            print(f"Error HTTP: {response.status}")
except Exception as e:
    print(f"Error: {e}")
