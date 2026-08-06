from typing import Optional
from app.core.config import settings

_supabase_client = None

def get_supabase():
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client
        
    if settings.SUPABASE_URL and settings.SUPABASE_KEY:
        try:
            from supabase import create_client
            _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            return _supabase_client
        except Exception as e:
            print(f"[Supabase] Warning: Error initializing Supabase client: {e}")
            return None
    return None
