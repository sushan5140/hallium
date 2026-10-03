import os
import tempfile
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, Header, HTTPException
from fastapi.responses import FileResponse
from melo.api import TTS
from pydantic import BaseModel, Field

app = FastAPI(title="Hallium MeloTTS", version="1.0.0")

DEVICE = os.getenv("MELOTTS_DEVICE", "auto")
SERVICE_TOKEN = os.getenv("MELOTTS_SERVICE_TOKEN", "")
ALLOW_UNAUTHENTICATED = os.getenv("MELOTTS_ALLOW_UNAUTHENTICATED", "").lower() == "true"

model = TTS(language="KR", device=DEVICE)
speaker_ids = model.hps.data.spk2id
speaker_id = next(iter(speaker_ids.values()))


class SynthesisRequest(BaseModel):
    text: str = Field(min_length=1, max_length=500)
    language: str = Field(default="KR")
    speed: float = Field(default=1.0, ge=0.7, le=1.3)


def require_token(authorization: str | None) -> None:
    if ALLOW_UNAUTHENTICATED:
        return
    if not SERVICE_TOKEN:
        raise HTTPException(status_code=503, detail="Service token is not configured")
    expected = f"Bearer {SERVICE_TOKEN}"
    if authorization != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.get("/health")
def health():
    return {
        "ok": True,
        "provider": "melotts",
        "language": "KR",
        "device": DEVICE,
    }


@app.post("/synthesize")
def synthesize(
    payload: SynthesisRequest,
    background_tasks: BackgroundTasks,
    authorization: str | None = Header(default=None),
):
    require_token(authorization)
    if payload.language.upper() != "KR":
        raise HTTPException(status_code=400, detail="Only Korean synthesis is enabled")

    fd, path = tempfile.mkstemp(prefix="hallium-tts-", suffix=".wav")
    os.close(fd)

    try:
        model.tts_to_file(
            payload.text,
            speaker_id,
            path,
            speed=float(payload.speed),
        )
    except Exception as exc:
        Path(path).unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Synthesis failed") from exc

    background_tasks.add_task(Path(path).unlink, missing_ok=True)
    return FileResponse(
        path,
        media_type="audio/wav",
        filename="hallium-korean.wav",
        headers={"Cache-Control": "no-store"},
    )
