"""
FinPath — Supabase Client Initialisation
══════════════════════════════════════════
Creates and exports two Supabase clients:

  • supabase_admin  — uses the JWT service_role key (bypasses RLS)
  • supabase_auth   — uses the public anon key (for Auth operations)

The service_role key MUST be a legacy JWT (starts with "eyJ").
The new sb_secret_* format is NOT accepted by supabase-py.

Required environment variables (set in .env.local):
  • SUPABASE_URL             — project REST URL
  • SUPABASE_ANON_KEY        — public anon JWT
  • SUPABASE_SERVICE_ROLE_KEY — secret service_role JWT

Secrets are NEVER printed or logged.
"""

import os
import re
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# ─────────────────────────────────────────────────────────────────────────────
# 1. Load environment files
# ─────────────────────────────────────────────────────────────────────────────
_project_root = Path(__file__).resolve().parent.parent
load_dotenv(_project_root / ".env.local")
load_dotenv(_project_root / ".env")  # won't overwrite already-set vars


# ─────────────────────────────────────────────────────────────────────────────
# 2. Read credentials — no silent fallbacks
# ─────────────────────────────────────────────────────────────────────────────
_JWT_RE = re.compile(r"^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_\-\.+/=]*$")


def _read(name: str) -> str:
    """Return a stripped env-var value, or empty string."""
    return os.environ.get(name, "").strip()


SUPABASE_URL: str = _read("SUPABASE_URL")
# Reject obvious placeholder URLs and fall back to the Vite value.
if "your-project-id" in SUPABASE_URL or not SUPABASE_URL.startswith("http"):
    SUPABASE_URL = _read("VITE_SUPABASE_URL")

_ANON_KEY: str = _read("SUPABASE_ANON_KEY")
# Only accept the value if it looks like a real JWT; otherwise fall back.
if not _JWT_RE.match(_ANON_KEY or ""):
    _ANON_KEY = _read("VITE_SUPABASE_ANON_KEY")

_SERVICE_ROLE_KEY: str = _read("SUPABASE_SERVICE_ROLE_KEY")


# ─────────────────────────────────────────────────────────────────────────────
# 3. Validate — every required variable, every time
# ─────────────────────────────────────────────────────────────────────────────
_errors: list[str] = []

if not SUPABASE_URL:
    _errors.append("SUPABASE_URL is not set.")
if not _ANON_KEY:
    _errors.append("SUPABASE_ANON_KEY is not set.")
if not _SERVICE_ROLE_KEY:
    _errors.append(
        "SUPABASE_SERVICE_ROLE_KEY is not set.  "
        "Copy the service_role JWT from Supabase Dashboard → "
        "Project Settings → API → service_role (secret) and add it "
        "to .env.local."
    )
elif not _JWT_RE.match(_SERVICE_ROLE_KEY):
    _errors.append(
        "SUPABASE_SERVICE_ROLE_KEY is not a valid JWT.  "
        "supabase-py only accepts legacy JWT keys (starting with 'eyJ'). "
        "The newer sb_secret_* format is not supported.  "
        "Copy the service_role key from Supabase Dashboard → "
        "Project Settings → API."
    )

if _errors:
    for e in _errors:
        print(f"FATAL: {e}", file=sys.stderr)
    sys.exit(1)


# ─────────────────────────────────────────────────────────────────────────────
# 4. Create clients
# ─────────────────────────────────────────────────────────────────────────────
# Admin — bypasses Row Level Security for all server-side operations.
supabase_admin: Client = create_client(SUPABASE_URL, _SERVICE_ROLE_KEY)

# Auth — public anon key used only for sign-up / sign-in flows.
supabase_auth: Client = create_client(SUPABASE_URL, _ANON_KEY)