#!/usr/bin/env bash
cd /Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab

echo "=== ENVIRONMENT DIAGNOSTICS ===" > .agents/challenger_backend_2/test_output.log
echo "Which python3: $(which python3)" >> .agents/challenger_backend_2/test_output.log
echo "Which pytest: $(which pytest)" >> .agents/challenger_backend_2/test_output.log
echo "Which uv: $(which uv)" >> .agents/challenger_backend_2/test_output.log
echo "PATH: $PATH" >> .agents/challenger_backend_2/test_output.log

# Check if python3 has ensurepip or pytest
python3 -c "import pytest; print('System pytest OK')" >> .agents/challenger_backend_2/test_output.log 2>&1 || true

# Try setting up pip or virtualenv if needed
python3 -m venv backend/.venv --clear >> .agents/challenger_backend_2/test_output.log 2>&1 || true
backend/.venv/bin/python -m ensurepip >> .agents/challenger_backend_2/test_output.log 2>&1 || true
backend/.venv/bin/python -m pip install -r backend/requirements.txt >> .agents/challenger_backend_2/test_output.log 2>&1 || true

echo "=== RUNNING VERIFICATION HARNESS ===" >> .agents/challenger_backend_2/test_output.log
backend/.venv/bin/python .agents/challenger_backend_2/verify_all.py >> .agents/challenger_backend_2/test_output.log 2>&1

echo "=== FINISHED TEST RUN ===" >> .agents/challenger_backend_2/test_output.log
