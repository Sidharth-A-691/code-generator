from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from services.generation_service_new import generation_service

router = APIRouter()

class GenerationRequest(BaseModel):
    user_stories: str = Field(..., description="The user stories for the application.")
    project_type: str = Field(..., description="Type of the project, e.g., 'backend' or 'frontend'")
    language: str = Field(..., description="Programming language or framework, e.g., 'springboot' or 'react'")
    output_directory: str = Field(..., description="Absolute path on the server to create the project directory.")

@router.post("/generate")
async def generate_code(request: GenerationRequest, background_tasks: BackgroundTasks):
    """
    This endpoint kicks off the automated code generation process.
    It runs as a background task to avoid HTTP timeouts for long generations.
    """
    try:
        background_tasks.add_task(
            generation_service.generate_application,
            request.user_stories,
            request.project_type,
            request.language,
            request.output_directory
        )
        return {"message": "Code generation process started successfully in the background. Check server logs for progress."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))