import io
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse

from models import GenerateRequest
from builder import build_pptx

app = FastAPI(title="PPTX Native Service", version="1.0.0")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/generate")
def generate(req: GenerateRequest):
    try:
        pptx_bytes = build_pptx(req.deck)
    except Exception as e:
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
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 5051))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
