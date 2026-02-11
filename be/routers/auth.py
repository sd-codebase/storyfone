from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from config import ADMIN_USERNAME, ADMIN_PASSWORD
from schemas import LoginRequest, LoginResponse
from services.auth import verify_password, create_access_token

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest) -> LoginResponse:
    if body.username != ADMIN_USERNAME or not verify_password(body.password, ADMIN_PASSWORD):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=body.username)
    return LoginResponse(access_token=token, token_type="bearer")
