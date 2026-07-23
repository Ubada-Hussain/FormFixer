# pdf2docx-service

A lightweight FastAPI microservice that converts PDF files to `.docx` (Word) format using the `pdf2docx` library.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Returns `{"status":"up"}` |
| `POST` | `/convert` | Accepts a PDF, returns a `.docx` file |

## Local Development

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Test with curl:
```bash
curl -X POST http://localhost:8000/convert \
  -F "file=@/path/to/document.pdf" \
  -o output.docx
```

## Deployment (Railway)

See the main project README for deployment instructions.
