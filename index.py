import sys
from pathlib import Path

# Keep the existing backend package imports working from the repository root.
BACKEND_DIR = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.main import app  # noqa: E402
