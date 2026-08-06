import subprocess
import os
import sys

def main():
    backend_dir = "/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab/backend"
    venv_dir = os.path.join(backend_dir, ".venv")
    venv_python = os.path.join(venv_dir, "bin", "python3")
    venv_pytest = os.path.join(venv_dir, "bin", "pytest")
    req_file = os.path.join(backend_dir, "requirements.txt")
    out_log = "/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab/.agents/worker_backend_m1_remediation/remediation_exec.log"

    with open(out_log, "w") as log:
        log.write("=== STEP 1: Create virtual environment ===\n")
        cmd1 = [sys.executable, "-m", "venv", "--clear", venv_dir]
        res1 = subprocess.run(cmd1, capture_output=True, text=True)
        log.write(f"Cmd: {' '.join(cmd1)}\nReturnCode: {res1.returncode}\nStdout:\n{res1.stdout}\nStderr:\n{res1.stderr}\n\n")

        log.write("=== STEP 2: Install pip inside venv or ensurepip ===\n")
        cmd2 = [venv_python, "-m", "ensurepip", "--default-pip"]
        res2 = subprocess.run(cmd2, capture_output=True, text=True)
        log.write(f"Cmd: {' '.join(cmd2)}\nReturnCode: {res2.returncode}\nStdout:\n{res2.stdout}\nStderr:\n{res2.stderr}\n\n")

        log.write("=== STEP 3: Install requirements via venv python -m pip ===\n")
        cmd3 = [venv_python, "-m", "pip", "install", "-r", req_file]
        res3 = subprocess.run(cmd3, capture_output=True, text=True)
        log.write(f"Cmd: {' '.join(cmd3)}\nReturnCode: {res3.returncode}\nStdout:\n{res3.stdout}\nStderr:\n{res3.stderr}\n\n")

        log.write("=== STEP 4: Check if pytest binary exists ===\n")
        pytest_exists = os.path.exists(venv_pytest)
        log.write(f"pytest path: {venv_pytest}, exists: {pytest_exists}\n\n")

        log.write("=== STEP 5: Run e2e tests script ===\n")
        script_path = os.path.join(backend_dir, "run_e2e_tests.sh")
        res5 = subprocess.run([script_path], cwd=backend_dir, capture_output=True, text=True)
        log.write(f"Cmd: {script_path}\nReturnCode: {res5.returncode}\nStdout:\n{res5.stdout}\nStderr:\n{res5.stderr}\n\n")

if __name__ == "__main__":
    main()
