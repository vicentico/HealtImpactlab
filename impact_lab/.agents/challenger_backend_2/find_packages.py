import sys
import os
import glob

print("Python version:", sys.version)
print("Executable:", sys.executable)
print("sys.path:", sys.path)

# Search site-packages in user home and system
search_patterns = [
    "/Users/familia_bustos_estrada/.local/lib/python*/site-packages",
    "/Users/familia_bustos_estrada/Library/Caches/pip",
    "/Users/familia_bustos_estrada/Library/Caches/uv",
    "/Users/familia_bustos_estrada/.cache",
    "/usr/local/lib/python*/site-packages",
]

found_paths = []
for pattern in search_patterns:
    for path in glob.glob(pattern):
        print("Checking path:", path)
        if os.path.exists(os.path.join(path, "pytest")) or os.path.exists(os.path.join(path, "pytest.py")):
            print("FOUND PYTEST IN:", path)
            found_paths.append(path)

# Check if we can add found paths to sys.path
for p in found_paths:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    import pytest
    print("SUCCESS: imported pytest from", pytest.__file__)
except ImportError as e:
    print("ImportError:", e)
