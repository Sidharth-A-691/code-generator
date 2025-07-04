from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as generation_router
import uvicorn

app = FastAPI(
    title="Automated Code Generation API",
    description="An API to generate codebases using LLMs and Gemini CLI.",
    version="1.0.0"
)
origins = [
    "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generation_router, prefix="/api", tags=["Code Generation"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Code Generation API"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )