import requests
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# 1. CONFIGURACIÓN
# Reemplaza esto con el CID real de tu carpeta (ej. "QmTuCidAQuI...")
IPFS_CID = "QmcoeRsFYeHzPD9Gx84aKD3tjLUKjvPEMSmoPs2GQmHR1t" 

# Usar Cloudflare o Pinata suele ser más rápido que ipfs.io
GATEWAY_URL = f"https://ipfs.io/ipfs/{IPFS_CID}/"

TOTAL_NFTS = 5555
MAX_WORKERS = 50  # Cuántas peticiones simultáneas hacer para evitar bloqueos por rate-limit

def fetch_metadata(token_id):
    """Descarga la metadata de un solo Token ID"""
    # NOTA: Si tus archivos no tienen la extensión .json en IPFS, quita el ".json" de la URL
    url = f"{GATEWAY_URL}{token_id}" #.json
    
    try:
        # Hacemos la petición con un timeout de 10 segundos
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # Lanza un error si el status no es 200 OK
        return token_id, response.json()
    except Exception as e:
        print(f"❌ Error al obtener #{token_id}: {e}")
        return token_id, None

def main():
    print(f"🚀 Iniciando descarga de {TOTAL_NFTS} Mingles desde IPFS...")
    master_data = {}

    # Usamos ThreadPoolExecutor para manejar los "batches" o hilos en paralelo
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Lanzamos todas las tareas
        futures = {executor.submit(fetch_metadata, i): i for i in range(1, TOTAL_NFTS + 1)}

        # Procesamos los resultados conforme van terminando
        for count, future in enumerate(as_completed(futures), 1):
            token_id, data = future.result()
            
            if data:
                # Guardamos usando el ID como llave en formato string
                master_data[str(token_id)] = data
            
            # Imprimimos el progreso cada 100 archivos para mantener la consola limpia
            if count % 100 == 0:
                print(f"✅ Descargados {count} de {TOTAL_NFTS}...")
            
            # Una micro-pausa opcional para ser amables con el servidor
            time.sleep(0.01)

    # 3. GUARDAR EL ARCHIVO FINAL
    print("\n💾 Escribiendo archivo JSON...")
    with open("mingles-metadata.json", "w", encoding="utf-8") as f:
        json.dump(master_data, f, indent=2, ensure_ascii=False)
    
    print(f"🎉 ¡Éxito! Se combinaron {len(master_data)} items en 'mingles-metadata.json'")

if __name__ == "__main__":
    main()