import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv

# Set paths
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

# Load .env file
dotenv_path = backend_dir / ".env"
load_dotenv(dotenv_path)

from app.core.config import settings
from app.db.supabase_client import get_supabase

def main():
    print(f"📡 Probando conexión REST con Supabase en: {settings.SUPABASE_URL}")
    print(f"🔑 Clave utilizada: {settings.SUPABASE_KEY[:12]}...")

    client = get_supabase()
    if not client:
        print("❌ No se pudo inicializar el cliente de Supabase.")
        return False

    print("✅ Cliente oficial Supabase inicializado exitosamente!")
    
    # 1. Probar consulta a la tabla patients
    try:
        res = client.table("patients").select("*").limit(5).execute()
        print(f"✅ Tabla 'patients' verificada en Supabase! Registros encontrados: {len(res.data)}")
        return True
    except Exception as e:
        print(f"ℹ️ Respuesta de Supabase al consultar tabla 'patients': {e}")
        print("💡 Nota: Si aún no has ejecutado `backend/app/db/schema.sql` en el SQL Editor de Supabase, las tablas se crearán tan pronto apliques el script DDL.")
        return True

if __name__ == "__main__":
    main()
