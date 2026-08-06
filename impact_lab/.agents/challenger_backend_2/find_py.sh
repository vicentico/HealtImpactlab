#!/usr/bin/env bash
cd /Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab

echo "=== SEARCHING FOR PYTEST & PIP ===" > .agents/challenger_backend_2/find_py.log
find /Users/familia_bustos_estrada -name "pytest" 2>/dev/null >> .agents/challenger_backend_2/find_py.log || true
find /usr/local -name "pytest" 2>/dev/null >> .agents/challenger_backend_2/find_py.log || true
find /opt -name "pytest" 2>/dev/null >> .agents/challenger_backend_2/find_py.log || true

echo "=== SEARCHING FOR PYTHON EXECUTABLES ===" >> .agents/challenger_backend_2/find_py.log
find /Users/familia_bustos_estrada -name "python3*" 2>/dev/null | grep "/bin/" >> .agents/challenger_backend_2/find_py.log || true
