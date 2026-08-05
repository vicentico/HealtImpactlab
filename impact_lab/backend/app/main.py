from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints.pacientes import router as pacientes_router
from app.api.endpoints.priorizacion import router as priorizacion_router

app = FastAPI(
    title="HealthImpactLab Backend API",
    description="Backend API & Motor de Priorización NT 118 / ECICEP para Salud Pública APS Chile",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pacientes_router)
app.include_router(priorizacion_router)

@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
