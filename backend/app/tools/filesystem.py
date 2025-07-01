import os
import subprocess
import zipfile
import requests
from langchain.tools import tool
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

@tool
def create_directory(path: str) -> str:
    """
    Creates a new directory at the specified path. 
    The path should be relative to the current working directory.
    This tool can also create nested directories (e.g., 'src/components').
    """
    try:
        os.makedirs(path, exist_ok=True)
        return f"Directory '{path}' created successfully."
    except Exception as e:
        return f"Error creating directory '{path}': {e}"

@tool
def write_file(path: str, content: str) -> str:
    """
    Writes or overwrites content to a file at the specified relative path.
    If the parent directories for the file do not exist, they will be created automatically.
    """
    try:
        parent_dir = os.path.dirname(path)
        if parent_dir:
            os.makedirs(parent_dir, exist_ok=True)
        
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return f"File '{path}' written successfully."
    except Exception as e:
        return f"Error writing to file '{path}': {e}"

@tool
def read_file(path: str) -> str:
    """
    Reads the entire content of a file at the specified relative path and returns it as a string.
    """
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return f"Error: File not found at '{path}'."
    except Exception as e:
        return f"Error reading file '{path}': {e}"

@tool
def list_directory(path: str = ".") -> str:
    """
    Lists all files and subdirectories within a specified relative path.
    Defaults to the current directory if no path is provided.
    """
    try:
        entries = os.listdir(path)
        if not entries:
            return f"The directory '{path}' is empty."
        return f"Contents of directory '{path}':\n- " + "\n- ".join(entries)
    except FileNotFoundError:
        return f"Error: Directory not found at '{path}'."
    except Exception as e:
        return f"Error listing directory '{path}': {e}"

@tool
def create_springboot_project(group_id: str = "com.example", artifact_id: str = "backend") -> str:
    """
    Creates a standard Maven Spring Boot project in a new directory named after the artifact_id.
    It uses start.spring.io to generate a zip file with a default project structure (including pom.xml and a main application class) and then unzips it.
    Use this as the first step for a Spring Boot backend.
    Arguments:
        group_id (str): The Java package group ID for the project. Defaults to 'com.example'.
        artifact_id (str): The name and directory for the project. Defaults to 'backend'.
    """
    zip_filename = f"{artifact_id}.zip"
    url = "https://start.spring.io/starter.zip"
    params = {
        'type': 'maven-project',
        'language': 'java',
        'bootVersion': '3.3.1',
        'baseDir': artifact_id,
        'groupId': group_id,
        'artifactId': artifact_id,
        'name': artifact_id,
        'dependencies': 'web,data-jpa,lombok' 
    }
    
    try:
        print(f"Requesting Spring Boot project '{artifact_id}' from start.spring.io...")
        response = requests.get(url, params=params, verify=False)
        response.raise_for_status() 

        with open(zip_filename, 'wb') as f:
            f.write(response.content)
        print(f"Downloaded {zip_filename} successfully.")

        print(f"Unzipping '{zip_filename}'...")
        with zipfile.ZipFile(zip_filename, 'r') as zip_ref:
            zip_ref.extractall(".")
        print("Unzipped successfully.")
        
        os.remove(zip_filename)
        print(f"Removed temporary file {zip_filename}.")
        
        return f"Spring Boot project '{artifact_id}' created successfully in the ./{artifact_id}/ directory."
    except Exception as e:
        return f"Error creating Spring Boot project: {e}"

@tool
def create_react_vite_project(project_name: str = "frontend") -> str:
    """
    Creates a new React project in a new directory named after the project_name.
    It uses the non-interactive 'npm create vite@latest' command.
    Use this as the first step for a React frontend.
    Arguments:
        project_name (str): The name and directory for the project. Defaults to 'frontend'.
    """
    command = ["npm", "create", "vite@latest", project_name, "--", "--template", "react"]
    try:
        print(f"Executing: {' '.join(command)}")
        process = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
            shell=True,
            timeout=300 
        )
        print(process.stdout)
        if process.stderr:
            print("Stderr:", process.stderr)
        return f"React + Vite project '{project_name}' created successfully."
    except subprocess.TimeoutExpired:
        error_message = f"Error: The command to create the React project timed out after 5 minutes."
        print(error_message)
        return error_message
    except subprocess.CalledProcessError as e:
        error_message = f"Error creating React project '{project_name}'. Return code: {e.returncode}\nOutput:\n{e.stdout}\nError:\n{e.stderr}"
        print(error_message)
        return error_message
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}"

tools = [
    create_directory,
    write_file,
    read_file,
    list_directory,
    create_springboot_project,
    create_react_vite_project,
]