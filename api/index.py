"""
FinPath — Flask API Backend
═══════════════════════════
Deployed as a Vercel Python Serverless Function.
Locally served on http://localhost:5001 for development.

Endpoints:
    GET  /api/health                 → Health check + Supabase connectivity
    POST /api/auth/signup            → Create a new Supabase Auth user
    POST /api/auth/signin            → Sign in an existing user
    GET  /api/profiles/me            → Get the authenticated user's profile
    PUT  /api/profiles/me            → Create or update the profile
    POST /api/financial-snapshots    → Save a financial snapshot
    GET  /api/financial-snapshots    → Get the user's latest snapshot
    POST /api/financial-goals        → Save financial goals
    GET  /api/financial-goals        → Get the user's latest goals
    POST /api/submit                 → Save a complete plan (snapshot + goals + plan)
    GET  /api/plans/latest           → Get the user's latest submitted plan
"""

from functools import wraps
from datetime import date

from flask import Flask, request, jsonify
from flask_cors import CORS

# Import pre-initialised Supabase clients from the dedicated module.
# Credentials are loaded and validated there — never here.
try:
    from api.supabase_client import supabase_admin, supabase_auth  # Vercel (package import)
except ImportError:
    from supabase_client import supabase_admin, supabase_auth  # Local (direct import)

# ─────────────────────────────────────────────────────────────────────────────
# Flask App
# ─────────────────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


# Return JSON for all HTTP errors (400, 404, 405, 500, etc.)
@app.errorhandler(Exception)
def _handle_exception(exc):
    import sys, traceback
    from werkzeug.exceptions import HTTPException
    if isinstance(exc, HTTPException):
        return jsonify({"error": exc.description}), exc.code
    traceback.print_exc(file=sys.stderr)
    return jsonify({"error": "Internal server error"}), 500


def _check_clients():
    """Return an error response if Supabase clients failed to initialise."""
    if supabase_admin is None or supabase_auth is None:
        return jsonify({"error": "Server configuration error — Supabase not connected"}), 503
    return None


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────
def get_bearer_token() -> str | None:
    """Extract the Bearer token from the Authorization header."""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:]
    return None


def require_auth(f):
    """Decorator that validates the Supabase JWT and passes the user dict."""
    @wraps(f)
    def decorated(*args, **kwargs):
        err = _check_clients()
        if err:
            return err

        token = get_bearer_token()
        if not token:
            return jsonify({"error": "Missing Authorization header"}), 401
        try:
            # Use supabase_auth (anon key) to call GoTrue — this is the key
            # format GoTrue expects.  supabase_admin's service_role key can
            # cause 403 responses on GoTrue's /auth/v1/user endpoint.
            user_response = supabase_auth.auth.get_user(token)
            user = user_response.user
            if not user:
                return jsonify({"error": "Invalid or expired token"}), 401
        except Exception as exc:
            import sys, traceback
            traceback.print_exc(file=sys.stderr)
            # GoTrue returns 403 for bad JWTs; always surface as 401 to the client
            return jsonify({"error": "Authentication failed"}), 401
        return f(user=user, *args, **kwargs)
    return decorated


def serialise_row(row: dict) -> dict:
    """Convert date/datetime objects to ISO strings for JSON serialisation."""
    out = {}
    for key, value in row.items():
        if isinstance(value, date):
            out[key] = value.isoformat()
        elif hasattr(value, "isoformat"):
            out[key] = value.isoformat()
        else:
            out[key] = value
    return out


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

# ── Health Check ─────────────────────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    """Verify the API is running and Supabase is reachable."""
    try:
        from api.supabase_client import SUPABASE_URL as _url
    except ImportError:
        from supabase_client import SUPABASE_URL as _url

    err = _check_clients()
    if err:
        return jsonify({
            "status": "error",
            "supabase_url": _url or "(not set)",
            "database": "not connected — check server environment variables",
        }), 503

    try:
        supabase_admin.table("profiles").select("id", count="exact").limit(1).execute()
        db_status = "connected"
    except Exception:
        db_status = "error — could not reach Supabase"

    return jsonify({
        "status": "ok",
        "supabase_url": _url,
        "database": db_status,
    })


# ── Authentication ───────────────────────────────────────────────────────────
@app.route("/api/auth/signup", methods=["POST"])
def signup():
    """Create a new Supabase Auth user."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    email = data.get("email", "").strip()
    password = data.get("password", "")
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    try:
        result = supabase_auth.auth.sign_up({"email": email, "password": password})
        user = result.user
        session = result.session
        return jsonify({
            "user": {"id": user.id, "email": user.email},
            "access_token": session.access_token if session else None,
            "message": "Account created successfully",
        }), 201
    except Exception as exc:
        error_msg = str(exc)
        if "already registered" in error_msg.lower() or "user already" in error_msg.lower():
            return jsonify({"error": "An account with this email already exists"}), 409
        return jsonify({"error": "Sign-up failed. Please try again."}), 400


@app.route("/api/auth/signin", methods=["POST"])
def signin():
    """Sign in an existing Supabase Auth user."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    email = data.get("email", "").strip()
    password = data.get("password", "")
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        result = supabase_auth.auth.sign_in_with_password(
            {"email": email, "password": password}
        )
        user = result.user
        session = result.session
        return jsonify({
            "user": {"id": user.id, "email": user.email},
            "access_token": session.access_token,
            "message": "Signed in successfully",
        })
    except Exception:
        return jsonify({"error": "Invalid email or password"}), 401


# ── Profile ──────────────────────────────────────────────────────────────────
@app.route("/api/profiles/me", methods=["GET"])
@require_auth
def get_profile(user):
    """Retrieve the authenticated user's profile."""
    try:
        result = supabase_admin.table("profiles").select("*").eq("id", user.id).execute()
        if not result.data:
            return jsonify({"profile": None, "message": "No profile found"})
        return jsonify({"profile": serialise_row(result.data[0])})
    except Exception:
        return jsonify({"error": "Could not retrieve profile"}), 500


@app.route("/api/profiles/me", methods=["PUT"])
@require_auth
def upsert_profile(user):
    """Create or update the authenticated user's profile."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    dob = data.get("date_of_birth")
    if dob == "":
        dob = None
    profile_data = {
        "id": user.id,
        "email": user.email,
        "full_name": data.get("full_name", ""),
        "phone": data.get("phone", ""),
        "date_of_birth": dob,
    }

    try:
        result = supabase_admin.table("profiles").upsert(profile_data).execute()
        return jsonify({"profile": serialise_row(result.data[0]), "message": "Profile saved"})
    except Exception:
        return jsonify({"error": "Could not save profile"}), 500


# ── Financial Snapshots ──────────────────────────────────────────────────────
@app.route("/api/financial-snapshots", methods=["POST"])
@require_auth
def save_snapshot(user):
    """Save a financial snapshot for the authenticated user."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    required = ["employment_status", "income_range", "monthly_expenses", "current_savings"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    snapshot_data = {
        "user_id": user.id,
        "employment_status": data["employment_status"],
        "income_range": data["income_range"],
        "monthly_expenses": data["monthly_expenses"],
        "current_savings": data["current_savings"],
    }

    try:
        result = supabase_admin.table("financial_snapshots").insert(snapshot_data).execute()
        return jsonify({"snapshot": serialise_row(result.data[0]), "message": "Snapshot saved"}), 201
    except Exception:
        return jsonify({"error": "Could not save snapshot"}), 500


@app.route("/api/financial-snapshots", methods=["GET"])
@require_auth
def get_latest_snapshot(user):
    """Get the authenticated user's most recent financial snapshot."""
    try:
        result = (
            supabase_admin.table("financial_snapshots")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if not result.data:
            return jsonify({"snapshot": None, "message": "No snapshot found"})
        return jsonify({"snapshot": serialise_row(result.data[0])})
    except Exception:
        return jsonify({"error": "Could not retrieve snapshot"}), 500


# ── Financial Goals ──────────────────────────────────────────────────────────
@app.route("/api/financial-goals", methods=["POST"])
@require_auth
def save_goals(user):
    """Save financial goals for the authenticated user."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    required = ["main_goal", "target_amount", "timeframe", "risk_preference"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    goals_data = {
        "user_id": user.id,
        "main_goal": data["main_goal"],
        "target_amount": data["target_amount"],
        "timeframe": data["timeframe"],
        "risk_preference": data["risk_preference"],
    }

    try:
        result = supabase_admin.table("financial_goals").insert(goals_data).execute()
        return jsonify({"goals": serialise_row(result.data[0]), "message": "Goals saved"}), 201
    except Exception:
        return jsonify({"error": "Could not save goals"}), 500


@app.route("/api/financial-goals", methods=["GET"])
@require_auth
def get_latest_goals(user):
    """Get the authenticated user's most recent financial goals."""
    try:
        result = (
            supabase_admin.table("financial_goals")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if not result.data:
            return jsonify({"goals": None, "message": "No goals found"})
        return jsonify({"goals": serialise_row(result.data[0])})
    except Exception:
        return jsonify({"error": "Could not retrieve goals"}), 500


# ── Financial Plans (Complete Submission) ────────────────────────────────────
@app.route("/api/submit", methods=["POST"])
@require_auth
def submit_plan(user):
    """
    Save a complete financial plan:
    1. Upsert profile
    2. Insert financial snapshot
    3. Insert financial goals
    4. Insert plan record linking snapshot + goals
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    personal = data.get("personal", {})
    financial = data.get("financial", {})
    goals = data.get("goals", {})

    try:
        # 1. Upsert profile
        dob = personal.get("date_of_birth", personal.get("dateOfBirth"))
        # Convert empty strings to None so Postgres DATE columns accept it
        if dob == "":
            dob = None
        profile_data = {
            "id": user.id,
            "email": user.email,
            "full_name": personal.get("full_name", personal.get("fullName", "")),
            "phone": personal.get("phone", ""),
            "date_of_birth": dob,
        }
        supabase_admin.table("profiles").upsert(profile_data).execute()

        # 2. Insert snapshot
        snapshot_data = {
            "user_id": user.id,
            "employment_status": financial.get("employment_status", financial.get("employmentStatus", "")),
            "income_range": financial.get("income_range", financial.get("incomeRange", "")),
            "monthly_expenses": financial.get("monthly_expenses", financial.get("monthlyExpenses", "")),
            "current_savings": financial.get("current_savings", financial.get("currentSavings", "")),
        }
        snapshot_result = supabase_admin.table("financial_snapshots").insert(snapshot_data).execute()
        snapshot_id = snapshot_result.data[0]["id"]

        # 3. Insert goals
        goals_data = {
            "user_id": user.id,
            "main_goal": goals.get("main_goal", goals.get("mainGoal", "")),
            "target_amount": goals.get("target_amount", goals.get("targetAmount", "")),
            "timeframe": goals.get("timeframe", ""),
            "risk_preference": goals.get("risk_preference", goals.get("riskPreference", "")),
        }
        goals_result = supabase_admin.table("financial_goals").insert(goals_data).execute()
        goals_id = goals_result.data[0]["id"]

        # 4. Insert plan
        plan_data = {
            "user_id": user.id,
            "snapshot_id": snapshot_id,
            "goals_id": goals_id,
            "status": "submitted",
        }
        plan_result = supabase_admin.table("financial_plans").insert(plan_data).execute()

        return jsonify({
            "plan": serialise_row(plan_result.data[0]),
            "snapshot": serialise_row(snapshot_result.data[0]),
            "goals": serialise_row(goals_result.data[0]),
            "message": "Financial plan submitted successfully",
        }), 201

    except Exception:
        import sys, traceback
        traceback.print_exc(file=sys.stderr)
        return jsonify({"error": "Could not submit plan"}), 500


@app.route("/api/plans/latest", methods=["GET"])
@require_auth
def get_latest_plan(user):
    """Get the user's most recent submitted plan with all related data."""
    try:
        plan_result = (
            supabase_admin.table("financial_plans")
            .select("*")
            .eq("user_id", user.id)
            .order("submitted_at", desc=True)
            .limit(1)
            .execute()
        )
        if not plan_result.data:
            return jsonify({"plan": None, "message": "No plans found"})

        plan = plan_result.data[0]

        snapshot_result = (
            supabase_admin.table("financial_snapshots")
            .select("*")
            .eq("id", plan["snapshot_id"])
            .execute()
        )

        goals_result = (
            supabase_admin.table("financial_goals")
            .select("*")
            .eq("id", plan["goals_id"])
            .execute()
        )

        profile_result = (
            supabase_admin.table("profiles")
            .select("*")
            .eq("id", user.id)
            .execute()
        )

        return jsonify({
            "plan": serialise_row(plan),
            "profile": serialise_row(profile_result.data[0]) if profile_result.data else None,
            "snapshot": serialise_row(snapshot_result.data[0]) if snapshot_result.data else None,
            "goals": serialise_row(goals_result.data[0]) if goals_result.data else None,
        })

    except Exception:
        return jsonify({"error": "Could not retrieve plan"}), 500


# ─────────────────────────────────────────────────────────────────────────────
# Local Development Entry Point
# ─────────────────────────────────────────────────────────────────────────────
# Vercel uses the `app` object directly via the @vercel/python builder.
# Locally, run: python api/index.py
if __name__ == "__main__":
    # Port 5000 is often used by macOS AirPlay Receiver — use 5001 instead.
    app.run(host="0.0.0.0", port=5001, debug=True)