from fastapi import FastAPI

app = FastAPI(title="RescueRoute AI API")


@app.get("/")
def root():
    return {"message": "RescueRoute AI backend is running"}


@app.get("/health")
def health():
    return {"status": "ok"}