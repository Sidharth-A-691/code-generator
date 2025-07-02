import os
import shutil
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from services.generation_service_new import generation_service 

router = APIRouter()

class GenerationRequest(BaseModel):
    user_stories: str = Field(..., description="The user stories for the application.")
    project_type: str = Field(..., description="Type of the project, e.g., 'backend' or 'frontend'")
    language: str = Field(..., description="Programming language or framework, e.g., 'springboot' or 'react'")
    output_directory: str = Field(..., description="Absolute path on the server to create the project directory.")

class DownloadRequest(BaseModel):
    output_directory: str = Field(..., description="The same absolute path used during generation.")
    project_name: str = Field(..., description="The name of the project folder to be zipped, e.g., 'backend' or 'frontend'.")

@router.post("/generate")
async def generate_code(request: GenerationRequest, background_tasks: BackgroundTasks):
    """
    Kicks off the automated code generation process as a background task.
    """
    try:
        background_tasks.add_task(
            generation_service.generate_application,
            request.user_stories,
            request.project_type,
            request.language,
            request.output_directory
        )
        return {"message": "Code generation process started successfully. Check server logs for progress."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/download")
async def download_project(request: DownloadRequest):
    """
    Zips the specified project directory and returns it for download.
    """
    project_path = os.path.join(request.output_directory, request.project_name)
    zip_filename = f"{request.project_name}.zip"
    
    temp_zip_path = os.path.join(request.output_directory, zip_filename)

    print(f"Request to download project from: {project_path}")

    if not os.path.isdir(project_path):
        print(f"Error: Directory not found at {project_path}")
        raise HTTPException(status_code=404, detail="Project directory not found. Please ensure generation is complete.")

    try:
        print(f"Creating archive for '{request.project_name}'...")
        shutil.make_archive(
            base_name=os.path.join(request.output_directory, request.project_name), 
            format='zip',
            root_dir=request.output_directory, 
            base_dir=request.project_name      
        )
        print(f"Archive created at: {temp_zip_path}")

        return FileResponse(
            path=temp_zip_path,
            media_type='application/zip',
            filename=zip_filename,
            background=BackgroundTasks([lambda: os.remove(temp_zip_path)])
        )
    except Exception as e:
        print(f"Error during zipping or file transfer: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create or send project archive: {e}")