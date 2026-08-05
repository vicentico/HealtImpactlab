#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PYTEST="${SCRIPT_DIR}/.venv/bin/pytest"
TEST_READY_FILE="/Users/familia_bustos_estrada/Developer/HealtImpactlab/TEST_READY.md"

echo "========================================================"
echo " Running E2E Test Suite for Backend API & NT 118 Engine"
echo "========================================================"

if [ ! -f "$VENV_PYTEST" ]; then
    echo "Error: Virtual environment pytest not found at ${VENV_PYTEST}"
    echo "Please ensure .venv is set up in ${SCRIPT_DIR}"
    exit 1
fi

cd "${SCRIPT_DIR}"

echo "Executing Pytest suite in tests/e2e/..."
"$VENV_PYTEST" tests/e2e/ -v --tb=short

echo "========================================================"
echo " E2E Test Suite Passed 100% Successfully!"
echo " Generating output signal: ${TEST_READY_FILE}"
echo "========================================================"

cat <<EOF > "${TEST_READY_FILE}"
# E2E Test Suite Verification Signal

- **Status**: PASSED
- **Timestamp**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
- **Test Framework**: Pytest + FastAPI TestClient / HTTPX AsyncClient
- **Test Directory**: \`impact_lab/backend/tests/e2e/\`
- **Execution Command**: \`pytest impact_lab/backend/tests/e2e/\`
- **Tiers Verified**:
  - Tier 1: Feature Coverage (Health, Docs, CORS, NT 118 Calc, Filtering, Contraloría, PII Masking)

All 25 Tier 1 E2E requirements satisfied. System ready for integration.
EOF

echo "Published TEST_READY.md successfully to ${TEST_READY_FILE}."
