import io
import logging
import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse

from models import GenerateRequest
from builder import build_pptx

logger = logging.getLogger(__name__)

app = FastAPI(title="PPTX Native Service", version="1.0.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/generate")
def generate(req: GenerateRequest) -> StreamingResponse:
    try:
        pptx_bytes = build_pptx(req.deck)
    except Exception as e:
        logger.exception("PPTX generation failed")
        raise HTTPException(status_code=500, detail=str(e))

    title = req.deck.title or "presentation"
    safe_title = "".join(c for c in title if c.isalnum() or c in " -_").strip()
    filename = f"{safe_title or 'deck'}.pptx"

    return StreamingResponse(
        io.BytesIO(pptx_bytes),
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5051))
    reload = os.environ.get("ENV") != "production"
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload)
