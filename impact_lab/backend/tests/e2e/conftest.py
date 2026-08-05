import sys
import os
import copy
import pytest

# Ensure backend root is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport
from app.main import app
import app.data.mock_db as mock_db

@pytest.fixture(autouse=True)
def reset_db_state():
    """
    Resets the mock_db patient list to clean initial state before each test.
    """
    initial_clean_patients = mock_db.get_initial_mock_patients()
    mock_db._db_patients = copy.deepcopy(initial_clean_patients)
    yield
    mock_db._db_patients = copy.deepcopy(initial_clean_patients)

@pytest.fixture
def client():
    """
    Synchronous FastAPI TestClient fixture.
    """
    return TestClient(app)

@pytest.fixture
async def async_client():
    """
    Async HTTP client fixture for FastAPI endpoint testing.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client

@pytest.fixture
def sample_priorization_payload():
    return {
        "patientId": "PAT-001",
        "hba1c": 11.4,
        "systolicBp": 165,
        "diastolicBp": 98,
        "vfg": 42.0,
        "hasFootUlcer": True,
        "hasRetinopathy": True,
        "daysInWaitingList": 142,
        "age": 67,
        "gender": "F",
        "sector": "SECTOR_ROJO",
        "cesfamName": "CESFAM Carol Urzúa"
    }

@pytest.fixture
def sample_contraloria_payload():
    return {
        "newStatus": "APROBADO",
        "clinicalNote": "Aprobado para cita prioritaria con especialidad de Diabetología.",
        "physicianName": "Dr. Alejandro Silva",
        "physicianRole": "Médico Contralor"
    }
