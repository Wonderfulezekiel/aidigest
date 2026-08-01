import sys
import os
import importlib.util

# Set up backend paths
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

backend_main_path = os.path.join(backend_dir, "app", "main.py")

spec = importlib.util.spec_from_file_location("backend_app_main", backend_main_path)
backend_module = importlib.util.module_from_spec(spec)
sys.modules["backend_app_main"] = backend_module
spec.loader.exec_module(backend_module)

app = backend_module.app

__all__ = ["app"]
