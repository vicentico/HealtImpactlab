# 📄 Guía Maestra: Estrategias de Rotación de Cuotas y Multi-Cuenta (Google Antigravity)

Bienvenido a la **Guía Maestra de Rotación de Cuotas para Google Antigravity & Gemini AI**. Esta guía explica cómo configurar y utilizar las estrategias multi-cuenta para superar los límites de tasa (**429 Too Many Requests** / **RESOURCE_EXHAUSTED**) mediante el pool de cuentas de Google AI Studio y GCP.

---

## 🛠️ Arquitectura de Rotación

Cuando trabajas con modelos de lenguaje de Google (Gemini 2.5, 2.0 Flash, 1.5 Pro) en el plan gratuito o estándar de Google AI Studio, las cuotas de peticiones (RPM/RPD) aplican por **Proyecto / Cuenta de Google**.

Para maximizar la disponibilidad y evitar interrupciones en el chat o backend, implementamos dos estrategias integradas en la carpeta `Engine/`:

---

## 🔑 Estrategia A: Router Nativo Multi-Cuenta en Python (`Engine/gemini_key_router.py`)

Esta estrategia es la opción directa recomendada para proyectos en Python.

### 📋 Cómo Funciona:
1. Lee automáticamente todas las claves numeradas del entorno: `GEMINI_ACCOUNT_1_KEY`, `GEMINI_ACCOUNT_2_KEY`, `GEMINI_ACCOUNT_3_KEY`, etc.
2. Mantiene un pool de claves activas y monitorea marcas de tiempo de cooldown.
3. Si una clave recibe una respuesta `429` o `RESOURCE_EXHAUSTED`, la marca en cooldown durante 60 segundos y conmuta automáticamente a la siguiente clave disponible del pool.

### ⚙️ Configuración en `.env`:
Agrega tantas cuentas como tengas disponibles en tu archivo `.env`:

```env
# Pool Multi-Cuenta Google AI Studio / GCP
GEMINI_ACCOUNT_1_KEY=AIzaSy... (Cuenta Principal)
GEMINI_ACCOUNT_2_KEY=AIzaSy... (Cuenta Secundaria)
GEMINI_ACCOUNT_3_KEY=AIzaSy... (Cuenta Respaldo)
```

### 💻 Ejemplo de Uso en Código:

```python
from Engine.gemini_key_router import key_router

# Obtener clave activa lista para usar
api_key = key_router.get_available_key()

# O ejecutar con reintento y failover automático:
def llamar_gemini(key, prompt):
    # tu lógica de cliente de Gemini aquí
    pass

resultado = key_router.execute_with_retry(llamar_gemini, "Hola, analiza este paciente")
```

---

## ⚙️ Estrategia B: Sidecar Proxy Local (`Engine/sidecars/antigravity_proxy.py`)

Esta estrategia es útil cuando utilizas herramientas externas, clientes de chat, o servicios que no pueden modificar su código de Python pero aceptan una URL de endpoint personalizada.

### 📋 Cómo Funciona:
1. Levanta un servidor proxy HTTP local en `http://localhost:8080`.
2. Intercepta las solicitudes HTTP salientes a la API de Google Gemini.
3. Inyecta la clave de API activa de forma transparente y maneja la rotación si el servidor responde con error de límite de tasa (`429`).

### 🚀 Cómo Ejecutar el Sidecar Proxy:

```bash
python Engine/sidecars/antigravity_proxy.py
```

* Salida esperada:
  `🌐 Antigravity Sidecar Proxy ejecutándose en http://0.0.0.0:8080`

---

## 👥 Guía Rápidas para Teammates

1. **Para agregar una nueva cuenta de Google al pool:**
   - Entra a [Google AI Studio](https://aistudio.google.com/) con tu cuenta secundaria.
   - Crea un nuevo API Key.
   - Agrégalo a tu `.env` con el siguiente número disponible (ej. `GEMINI_ACCOUNT_3_KEY=...`).
2. **Sin reiniciar la app:** El router detecta y rota las claves activas sin interrumpir la sesión.

---

*Health OS — Google Antigravity Agentic Integration*
