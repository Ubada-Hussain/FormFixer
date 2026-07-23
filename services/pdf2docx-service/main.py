from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
import tempfile
import os
import uuid
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="pdf2docx-service", version="1.0.0")


@app.get("/health")
def health():
    return {"status": "up"}


@app.post("/convert")
async def convert_pdf_to_docx(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type: '{file.filename}'. Only PDF files are accepted."
        )

    # Read uploaded bytes
    pdf_bytes = await file.read()
    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    logger.info(f"Converting '{file.filename}' ({len(pdf_bytes)} bytes) → .docx")

    # Write to a named temp file so pdf2docx can open it by path
    tmp_dir = tempfile.mkdtemp()
    pdf_path = os.path.join(tmp_dir, f"{uuid.uuid4()}.pdf")
    docx_path = pdf_path.replace(".pdf", ".docx")

    try:
        with open(pdf_path, "wb") as f:
            f.write(pdf_bytes)

        # pdf2docx conversion
        from pdf2docx import Converter
        cv = Converter(pdf_path)
        cv.convert(docx_path, start=0, end=None)
        cv.close()

        if not os.path.exists(docx_path):
            raise HTTPException(status_code=500, detail="Conversion produced no output file.")

        output_name = os.path.splitext(file.filename)[0] + "-converted.docx"
        logger.info(f"Conversion successful → {docx_path} ({os.path.getsize(docx_path)} bytes)")

        return FileResponse(
            path=docx_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=output_name,
            background=None,  # keep file alive until response is sent
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Conversion error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")
