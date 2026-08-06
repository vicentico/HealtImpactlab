import os
import sys
import json
import urllib.request
import hashlib

VERCEL_TOKEN = os.getenv("VERCEL_TOKEN", "")
TEAM_ID = "team_qD6yWVGa0H17VtATfGrrXhU1"
DIST_DIR = "/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab/dist"

def get_file_payload(filepath, relpath):
    with open(filepath, "rb") as f:
        data = f.read()
    sha = hashlib.sha1(data).hexdigest()
    return {
        "file": relpath,
        "sha": sha,
        "size": len(data),
        "data": data
    }

def main():
    print("🚀 Preparando despliegue directo de Health OS a Vercel...")
    
    files_to_upload = []
    file_map = {}
    
    for root, dirs, files in os.walk(DIST_DIR):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, DIST_DIR)
            payload = get_file_payload(full_path, rel_path)
            files_to_upload.append({
                "file": rel_path,
                "sha": payload["sha"],
                "size": payload["size"]
            })
            file_map[payload["sha"]] = payload["data"]
            
    print(f"📦 Archivos detectados en dist/: {len(files_to_upload)}")

    # Create Deployment Payload
    deployment_body = {
        "name": "health-os",
        "project": "health-os",
        "target": "production",
        "files": files_to_upload,
        "projectSettings": {
            "framework": "vite"
        }
    }

    url = f"https://api.vercel.com/v13/deployments?teamId={TEAM_ID}"
    req = urllib.request.Request(
        url,
        data=json.dumps(deployment_body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {VERCEL_TOKEN}",
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))
            
        print("\n✅ ¡Despliegue Creado Exitosamente en Vercel!")
        print(f"🔗 ID Despliegue: {res_data.get('id')}")
        print(f"🌐 URL de Producción: https://{res_data.get('url')}")
        if "alias" in res_data and len(res_data["alias"]) > 0:
            print(f"🌟 URL Oficial: https://{res_data['alias'][0]}")
            
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f"❌ Error en despliegue Vercel API: {e.code} - {err_body}")

if __name__ == "__main__":
    main()
