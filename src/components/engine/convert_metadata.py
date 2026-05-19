import json
import os

input_file = 'mingles-metadata.ts'
output_file = 'mingles-metadata-clean.json'

def convert_metadata():
    print("🔄 Iniciando conversión de Metadatos con Python...")
    
    try:
        # 1. Leer el archivo TypeScript
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 2. Limpiar la sintaxis de TypeScript para que sea un JSON válido
        # Encontramos la primera llave '{' y la última '}'
        start_index = content.find('{')
        end_index = content.rfind('}') + 1
        
        if start_index == -1 or end_index == 0:
            print("❌ Error: No se encontró la estructura de datos en el archivo.")
            return

        json_string = content[start_index:end_index]
        
        # 3. Convertir el texto a un diccionario de Python
        # (Si esto falla, suele ser por alguna coma extra al final típica de JS)
        data = json.loads(json_string)
        
        clean_metadata = []
        
        # 4. Extraer solo 'edition' y 'attributes'
        for key, nft in data.items():
            clean_metadata.append({
                "edition": nft.get("edition"),
                "attributes": nft.get("attributes", [])
            })
            
        # 5. Ordenar estrictamente del 1 al 5555
        clean_metadata = sorted(clean_metadata, key=lambda x: x["edition"])
        
        # 6. Guardar el nuevo archivo
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(clean_metadata, f, indent=2, ensure_ascii=False)
            
        print(f"✅ ¡Éxito! Archivo generado con {len(clean_metadata)} Mingles.")
        print(f"📁 Guardado en: {os.path.abspath(output_file)}")
        
    except json.JSONDecodeError as e:
        print(f"❌ Error al decodificar el JSON: {e}")
        print("💡 Tip: Asegúrate de que el archivo .ts no tenga comas sobrantes al final de los objetos (trailing commas).")
    except Exception as e:
        print(f"❌ Ocurrió un error inesperado: {e}")

if __name__ == "__main__":
    convert_metadata()