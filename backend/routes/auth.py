from uuid import uuid4

from fastapi import APIRouter, HTTPException
from models.schemas import AuthPayload
from services.supabase_service import supabase_service

router = APIRouter(prefix="/auth", tags=["auth"])

_local_users: dict[str, dict[str, str]] = {}


def _unwrap_response(response):
    data = getattr(response, "data", None)
    error = getattr(response, "error", None)

    if isinstance(response, dict):
        data = response.get("data", data)
        error = response.get("error", error)

    return data, error


def _build_local_auth_payload(email: str):
    user_id = f"local-{uuid4()}"
    return {
        "user": {"id": user_id, "email": email},
        "session": {
            "access_token": f"local-access-{uuid4()}",
            "refresh_token": f"local-refresh-{uuid4()}",
        },
    }


@router.post("/register")
async def register(payload: AuthPayload):
    if not supabase_service.connected:
        if payload.email in _local_users:
            raise HTTPException(status_code=400, detail="User already exists.")

        auth_data = _build_local_auth_payload(payload.email)
        _local_users[payload.email] = {
            "password": payload.password,
            "user_id": auth_data["user"]["id"],
        }
        return {"message": "Registration completed", "data": auth_data}

    try:
        response = supabase_service.client.auth.sign_up(
            {"email": payload.email, "password": payload.password}
        )
        data, error = _unwrap_response(response)

        if error:
            print(f"[ERROR] Supabase register failed: {error}")
            raise HTTPException(status_code=400, detail=getattr(error, "message", str(error)))

        print(f"[INFO] User registered: {payload.email}")
        return {"message": "Registration completed", "data": data}
    except Exception as exc:
        print(f"[ERROR] Supabase registration failed: {exc}")
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/login")
async def login(payload: AuthPayload):
    if not supabase_service.connected:
        user = _local_users.get(payload.email)
        if not user or user["password"] != payload.password:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        return {
            "message": "Login successful",
            "data": {
                "user": {"id": user["user_id"], "email": payload.email},
                "session": {
                    "access_token": f"local-access-{uuid4()}",
                    "refresh_token": f"local-refresh-{uuid4()}",
                },
            },
        }

    try:
        response = supabase_service.client.auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
        data, error = _unwrap_response(response)

        if error:
            print(f"[ERROR] Supabase login failed: {error}")
            raise HTTPException(status_code=401, detail=getattr(error, "message", str(error)))

        print(f"[INFO] User logged in: {payload.email}")
        return {"message": "Login successful", "data": data}
    except Exception as exc:
        print(f"[ERROR] Supabase login failed: {exc}")
        raise HTTPException(status_code=400, detail=str(exc))
