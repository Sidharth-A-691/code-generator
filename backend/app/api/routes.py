import os
import shutil
from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from services.generation_service_new import generation_service
from utils.config import settings
from utils.logger import logger
from urllib.parse import unquote

router = APIRouter()

class GenerationRequest(BaseModel):
    user_stories: str = Field(...)
    project_type: str = Field(...)
    language: str = Field(...)
    
class GenerationResponse(BaseModel):
    message: str
    high_level_design: str
    low_level_design: str

class DownloadRequest(BaseModel):
    project_name: str = Field(...)

class FileWriteRequest(BaseModel):
    project_name: str = Field(..., description="The name of the project folder.")
    relative_path: str = Field(..., description="The relative path of the file within the project folder to write to.")
    content: str = Field(..., description="The new content of the file.")

def get_safe_project_path(base_dir: str, project_name: str) -> str:
    """Validates and constructs a safe project path."""
    project_path = os.path.abspath(os.path.join(base_dir, project_name))
    if not project_path.startswith(os.path.abspath(base_dir)):
        raise HTTPException(status_code=400, detail="Invalid path: Path traversal detected.")
    if not os.path.isdir(project_path):
        raise HTTPException(status_code=404, detail=f"Project directory not found at: {project_path}")
    return project_path

@router.post("/generate", response_model=GenerationResponse, tags=["Code Generation"])
async def generate_code(request: GenerationRequest, background_tasks: BackgroundTasks):
    """
    Kicks off the code generation process.
    1. Synchronously generates the design and plan.
    2. Immediately returns the high-level and low-level designs.
    3. Executes the plan to write files as a background task.
    """
    try:
        print("Step 1: Generating structured designs and plan from Azure OpenAI...")
        structured_response = generation_service._create_structured_plan(
            user_stories=request.user_stories,
            project_type=request.project_type,
            language=request.language
        )
        print("\nStep 2: Handing off Scaffolding Plan to Agent for background execution...")
        plan_steps = structured_response['plan']
        background_tasks.add_task(
            generation_service._execute_plan,
            plan_steps=plan_steps,
            output_directory=settings.OUTPUT_DIRECTORY
        )
        print("\nStep 3: Returning HLD and LLD to client immediately.")
        return GenerationResponse(
            message="Design phase complete. Code generation is running in the background.",
            high_level_design=structured_response['high_level_design'],
            low_level_design=structured_response['low_level_design']
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed during the design phase: {str(e)}")

# --- NEW FILE SYSTEM API ENDPOINTS ---

@router.get("/files/tree", tags=["File System API"])
async def get_file_tree(project_name: str = Query(...)):
    """Returns the recursive file and folder structure of a generated project."""
    try:
        project_path = get_safe_project_path(settings.OUTPUT_DIRECTORY, project_name)
        print(settings.OUTPUT_DIRECTORY)
        tree = generation_service.list_directory_recursive(project_path)
        return tree
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list directory: {e}")

@router.get("/files/content", tags=["File System API"])
async def get_file_content(project_name: str = Query(...), relative_path: str = Query(...)):
    """Returns the content of a specific file."""
    try:
        project_path = get_safe_project_path(settings.OUTPUT_DIRECTORY, project_name)
        file_path = os.path.abspath(os.path.join(project_path, relative_path))
        logger.info(file_path)
        if not file_path.startswith(project_path):
            raise HTTPException(status_code=400, detail="Invalid path: Path traversal detected.")
        
        content = generation_service.read_file_content(file_path)
        return {"content": content}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found.")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {e}")

@router.post("/files/content", tags=["File System API"])
async def write_file_content(request: FileWriteRequest):
    """Writes content to a specific file."""
    try:
        project_path = get_safe_project_path(settings.OUTPUT_DIRECTORY, request.project_name)
        file_path = os.path.abspath(os.path.join(project_path, request.relative_path))
        if not file_path.startswith(project_path):
            raise HTTPException(status_code=400, detail="Invalid path: Path traversal detected.")
            
        generation_service.write_file_content(file_path, request.content)
        return {"message": f"File '{request.relative_path}' saved successfully."}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write file: {e}")

# --- Download Endpoint (Unchanged) ---
@router.post("/download", tags=["Code Generation"])
async def download_project(request: DownloadRequest):
    """Zips the project directory and returns it for download."""
    try:
        # project_path = get_safe_project_path(request.output_directory, request.project_name)
        zip_base_path = os.path.join(settings.OUTPUT_DIRECTORY, request.project_name)
        zip_file_path = shutil.make_archive(
            base_name=zip_base_path,
            format='zip',
            root_dir=settings.OUTPUT_DIRECTORY,
            base_dir=request.project_name
        )
        zip_filename = os.path.basename(zip_file_path)

        return FileResponse(
            path=zip_file_path,
            media_type='application/zip',
            filename=zip_filename,
            background=BackgroundTasks([lambda: os.remove(zip_file_path)]) 
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create or send project archive: {e}")