#!/usr/bin/env bash
cd /Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab

echo "=== DOWNLOADING GET-PIP.PY VIA PYTHON ===" > .agents/challenger_backend_2/pip_setup.log
python3 -c "import urllib.request; urllib.request.urlretrieve('https://bootstrap.pypa.io/get-pip.py', '/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab/.agents/challenger_backend_2/get-pip.py')" >> .agents/challenger_backend_2/pip_setup.log 2>&1

echo "=== INSTALLING PIP ===" >> .agents/challenger_backend_2/pip_setup.log
python3 .agents/challenger_backend_2/get-pip.py --user >> .agents/challenger_backend_2/pip_setup.log 2>&1

echo "=== INSTALLING REQUIREMENTS ===" >> .agents/challenger_backend_2/pip_setup.log
python3 -m pip install --user -r backend/requirements.txt >> .agents/challenger_backend_2/pip_setup.log 2>&1

echo "=== RUNNING VERIFICATION HARNESS ===" >> .agents/challenger_backend_2/pip_setup.log
python3 .agents/challenger_backend_2/verify_all.py >> .agents/challenger_backend_2/pip_setup.log 2>&1
echo "=== FINISHED ===" >> .agents/challenger_backend_2/pip_setup.log
