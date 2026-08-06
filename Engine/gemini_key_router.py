import os
import time
import logging
from typing import List, Optional, Dict, Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [GeminiKeyRouter] %(message)s")
logger = logging.getLogger("GeminiKeyRouter")

class GeminiKeyRouter:
    """
    Router Nativo Multi-Cuenta / Multi-Proyecto para Google Gemini AI.
    Permite rotar transparentemente múltiples API Keys de Google AI Studio / GCP
    para superar los límites de cuota (RPM/RPD - 429 Too Many Requests / RESOURCE_EXHAUSTED).
    """

    def __init__(self, cooldown_seconds: int = 60):
        self.cooldown_seconds = cooldown_seconds
        self.api_keys: List[str] = self._load_keys_from_env()
        self.current_index: int = 0
        self.key_cooldowns: Dict[str, float] = {}

        if not self.api_keys:
            logger.warning("⚠️ No se encontraron claves en el entorno. Configura GEMINI_ACCOUNT_1_KEY, GEMINI_ACCOUNT_2_KEY o GEMINI_API_KEY.")

    def _load_keys_from_env(self) -> List[str]:
        keys = []
        # Check standard GEMINI_ACCOUNT_1_KEY, GEMINI_ACCOUNT_2_KEY, etc.
        idx = 1
        while True:
            key = os.getenv(f"GEMINI_ACCOUNT_{idx}_KEY") or os.getenv(f"GEMINI_API_KEY_{idx}")
            if not key:
                break
            keys.append(key.strip())
            idx += 1

        # Fallback to standard single keys if numbered ones not found
        if not keys:
            single_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
            if single_key:
                keys.append(single_key.strip())

        logger.info(f"🔑 Cargadas {len(keys)} clave(s) de Gemini en el pool de rotación.")
        return keys

    def get_available_key(self) -> str:
        """Obtiene la siguiente clave de API disponible que no esté en cooldown."""
        if not self.api_keys:
            raise ValueError("No hay API Keys de Gemini disponibles en el entorno.")

        now = time.time()
        start_idx = self.current_index

        for _ in range(len(self.api_keys)):
            candidate_key = self.api_keys[self.current_index]
            cooldown_until = self.key_cooldowns.get(candidate_key, 0)

            if now >= cooldown_until:
                # Key is active and ready
                selected_key = candidate_key
                self.current_index = (self.current_index + 1) % len(self.api_keys)
                return selected_key

            # Move to next candidate
            self.current_index = (self.current_index + 1) % len(self.api_keys)

        # All keys in cooldown — return the one that expires soonest
        soonest_key = min(self.api_keys, key=lambda k: self.key_cooldowns.get(k, 0))
        wait_time = max(1.0, self.key_cooldowns[soonest_key] - now)
        logger.warning(f"⏳ Todas las claves están en cooldown. Esperando {wait_time:.1f}s en la clave con menor tiempo restante...")
        time.sleep(wait_time)
        return soonest_key

    def mark_rate_limited(self, key: str):
        """Marca una clave con límite de cuota (429) para que entre en cooldown."""
        cooldown_until = time.time() + self.cooldown_seconds
        self.key_cooldowns[key] = cooldown_until
        key_masked = f"{key[:8]}...{key[-4:]}" if len(key) > 12 else "KEY***"
        logger.warning(f"🚫 Clave {key_masked} marcada con Rate Limit (429). En cooldown durante {self.cooldown_seconds}s.")

    def execute_with_retry(self, func_call, *args, max_retries: int = 3, **kwargs):
        """Ejecuta una llamada con reintento y failover automático entre claves de API."""
        last_exception = None
        for attempt in range(max_retries):
            key = self.get_available_key()
            try:
                return func_call(key, *args, **kwargs)
            except Exception as e:
                err_msg = str(e).lower()
                if "429" in err_msg or "resource_exhausted" in err_msg or "quota" in err_msg:
                    self.mark_rate_limited(key)
                    last_exception = e
                else:
                    raise e
        raise RuntimeError(f"❌ Fallaron todos los reintentos tras agotar las claves disponibles: {last_exception}")

# Singleton Router Instance
key_router = GeminiKeyRouter()
