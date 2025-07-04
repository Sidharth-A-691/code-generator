import os
import json
from typing import List, Dict, Any
from pydantic.v1 import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from utils.llms import model, filesystem_agent_executor

class ScaffoldingResponse(BaseModel):
    high_level_design: str = Field(description="A high-level overview of the application architecture, components, and user flow.")
    low_level_design: str = Field(description="Detailed schema for database models, API endpoints, and request/response structures.")
    plan: List[str] = Field(description="A step-by-step plan of agent tool calls to create the project structure and files.")

class CodeGenerationService:
    def __init__(self):
        """
        Initializes the service. No session management is needed in this architecture.
        """
        pass

    def _create_structured_plan(self, user_stories: str, project_type: str, language: str) -> ScaffoldingResponse:
        """
        Creates a detailed design and scaffolding plan, returning it as a structured JSON object.
        """
        parser = JsonOutputParser(pydantic_object=ScaffoldingResponse)

        template = """
        You are a world-class Solution Architect. Your task is to analyze user stories and produce a complete design and scaffolding plan for an AI agent.

        **Input Details:**
        - User Stories: {user_stories}
        - Project Type: {project_type}
        - Language/Framework: {language}

        **Output Instructions:**
        You MUST provide your response as a JSON object that strictly follows this format:
        {format_instructions}

        **Design and Plan Details:**
        1.  **high_level_design**: Describe the application's architecture. What are the major components? How do they interact? Everything must be in detail.
        2.  **low_level_design**: Define the specifics. If there's a database, define the table schemas. For APIs, define the endpoints (e.g., POST /api/users), and the JSON request/response bodies. Everything must be in detail.
        3.  **plan**: Provide a step-by-step list of commands for the AI agent. This plan will be executed to build the project.
            - Start with a high-level tool call like `create_springboot_project` or `create_react_vite_project`.
            - Follow with low-level tool calls like `write_file` or `create_directory` to modify the base project.
            - All file paths in the plan must be relative to the project directory created in the first step (e.g., 'backend/src/...' or 'frontend/src/...').

        **Example for 'plan' (springboot):**
        ["Create a new Spring Boot project using the `create_springboot_project` tool with the `artifact_id` set to 'backend'.", "Write a new file named `backend/src/main/java/com/example/backend/model/User.java`. It should be a JPA Entity for a 'users' table.", "Write a new file named `backend/src/main/java/com/example/backend/repository/UserRepository.java`. It should be a JpaRepository interface for the User entity."]

        **Example for 'plan' (react):**
        ["Create a new React project using the `create_react_vite_project` tool with the `project_name` set to 'frontend'.", "Create a new directory named `frontend/src/components`.", "Write a new file named `frontend/src/components/LoginForm.jsx`.", "Overwrite the existing file named `frontend/src/App.jsx` to import and render the `LoginForm` component."]

        ---
        **CRUCIAL GUIDELINES FOR REACT FRONTEND PLAN:**
        When designing the 'plan' for a React project, you must adhere to the following principles to ensure a professional, functional, and maintainable application:

        1.  **Component-Based Architecture:**
            - Break down the UI into logical, reusable components (e.g., `Header.jsx`, `LoginForm.jsx`, `UserList.jsx`).
            - For each component, the plan must include a `write_file` command to create its own `.jsx` file inside a `components` directory.

        2.  **Styling with Native CSS:**
            - Create a main `App.css` file for global styles (fonts, body background, etc.) and ensure it's imported in `App.jsx`.
            - For individual components, write clean, modern CSS. Use modern layout techniques like Flexbox or Grid to create professional-looking layouts.
            - The final UI should not look like unstyled HTML. It needs padding, margins, a consistent color scheme, and good typography.

        3.  **State Management and Logic:**
            - Implement all necessary JavaScript logic within the components to make them interactive.
            - Use React hooks like `useState` to manage state (e.g., form input values) and `useEffect` for side effects.
            - Event handlers (like `onClick`, `onChange`, `onSubmit`) must be correctly implemented.

        4.  **Connectivity and Imports (MOST IMPORTANT):**
            - This is critical: **You MUST ensure all component and CSS imports are correct.**
            - When a parent component (e.g., `App.jsx`) uses a child component (e.g., `LoginForm.jsx`), the `write_file` or `overwrite_file` command for the parent component's content **MUST** include the correct import statement at the top (e.g., `import LoginForm from './components/LoginForm';`).
            - A failure to include correct imports will result in a broken application. Double-check all relative paths.
            - Make sure to import the necessary css files from the syles folder (ensure path is correct)

        5.  **Completeness:**
            - The plan must be comprehensive enough to generate a fully working application that fulfills the user stories from the start.
            - The final generated code should run without console errors related to syntax or missing imports.
        ---

        Provide the final JSON response now.
        """
        
        prompt = ChatPromptTemplate.from_template(
            template,
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )
        
        chain = prompt | model | parser
        
        print("Requesting structured design and plan from LLM...")
        result = chain.invoke({
            "user_stories": user_stories,
            "project_type": project_type,
            "language": language
        })
        return result

    def _execute_plan(self, plan_steps: List[str], output_directory: str):
        """
        Executes the scaffolding plan using the filesystem_agent_executor.
        """
        plan_string = "\n".join(f"{i+1}. {step}" for i, step in enumerate(plan_steps))
        
        print(f"Executing plan in directory: {output_directory}")
        if not os.path.exists(output_directory):
            os.makedirs(output_directory)
            print(f"Created base directory: {output_directory}")

        original_directory = os.getcwd()
        os.chdir(output_directory)
        print(f"Changed working directory to: {os.getcwd()}")

        execution_prompt = f"""
        Execute the following plan step-by-step. Your current working directory is the root for the project.

        --- BEGIN PLAN ---
        {plan_string}
        --- END PLAN ---
        """
        try:
            result = filesystem_agent_executor.invoke({"input": execution_prompt})
            final_output = result.get('output', 'Agent execution finished with no final output.')
            print("--- Plan Execution Finished ---")
            print(f"Final output from agent: {final_output}")
            
            return {"success": True, "details": final_output}
        except Exception as e:
            print(f"ERROR: An error occurred during plan execution: {e}")
            raise
        finally:
            os.chdir(original_directory)
            print(f"Returned to original directory: {os.getcwd()}")

    def generate_application(self, user_stories: str, project_type: str, language: str, output_directory: str):
        """
        Main method to orchestrate the generation process.
        """
        print("Step 1: Generating Structured Designs and Plan from Azure OpenAI...")
        structured_response = self._create_structured_plan(user_stories, project_type, language)
        
        print("\n--- HIGH-LEVEL DESIGN ---")
        print(structured_response['high_level_design'])
        print("\n--- LOW-LEVEL DESIGN ---")
        print(structured_response['low_level_design'])
        print("\n--- SCAFFOLDING PLAN ---")
        print(json.dumps(structured_response['plan'], indent=2))

        print("\nStep 2: Handing off Scaffolding Plan to Agent for execution...")
        
        result = self._execute_plan(structured_response['plan'], output_directory)
        return result

    def list_directory_recursive(self, path: str) -> List[Dict[str, Any]]:
        """
        Recursively lists files and directories for a given path.
        Returns a list suitable for building a file tree in the UI.
        """
        file_tree = []
        for entry in os.scandir(path):
            node = {
                "name": entry.name,
                "path": os.path.relpath(entry.path, start=os.path.dirname(path)),
                "type": "directory" if entry.is_dir() else "file"
            }
            if entry.is_dir():
                node["children"] = self.list_directory_recursive(entry.path)
            file_tree.append(node)
        return file_tree

    def read_file_content(self, file_path: str) -> str:
        """Reads and returns the content of a specific file."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found at: {file_path}")
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()

    def write_file_content(self, file_path: str, content: str) -> None:
        """Writes content to a specific file, creating parent directories if necessary."""
        try:
            parent_dir = os.path.dirname(file_path)
            if not os.path.exists(parent_dir):
                os.makedirs(parent_dir)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
        except Exception as e:
            raise IOError(f"Could not write to file at {file_path}: {e}")

generation_service = CodeGenerationService()