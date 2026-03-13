import urllib.request
import json

try:
    with urllib.request.urlopen("http://localhost:8000/api/empresas") as response:
        if response.status == 200:
            data = json.loads(response.read().decode())
            for e in data:
                print(f"Empresa ID: {e.get('id')} | Nombre: {e.get('nombre')}")
        else:
            print(f"Error: {response.status}")
except Exception as e:
    print(f"Error: {e}")
