import subprocess
import os
import sys

def main():
    backend_dir = "/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab/backend"
    venv_pip = os.path.join(backend_dir, ".venv", "bin", "pip")
    venv_pytest = os.path.join(backend_dir, ".venv", "bin", "pytest")
    req_file = os.path.join(backend_dir, "requirements.txt")
    run_script = os.path.join(backend_dir, "run_e2e_tests.sh")
    log_file = "/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab/.agents/worker_backend_m1_remediation/install_test.log"

    with open(log_file, "w", buffering=1) as f:
        f.write("Starting pip install...\n")
        res1 = subprocess.run([venv_pip, "install", "-r", req_file], capture_output=True, text=True)
        f.write(f"pip install exit code: {res1.returncode}\n")
        f.write(f"pip stdout:\n{res1.stdout}\n")
        f.write(f"pip stderr:\n{res1.stderr}\n\n")

        pytest_exists = os.path.exists(venv_pytest)
        f.write(f"Pytest binary exists at {venv_pytest}: {pytest_exists}\n\n")

        f.write("Running run_e2e_tests.sh...\n")
        res2 = subprocess.run([run_script], cwd=backend_dir, capture_output=True, text=True)
        f.write(f"run_e2e_tests.sh exit code: {res2.returncode}\n")
        f.write(f"script stdout:\n{res2.stdout}\n")
        f.write(f"script stderr:\n{res2.stderr}\n\n")

if __name__ == "__main__":
    main()
