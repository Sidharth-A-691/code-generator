import os
import json
from utils.llms import model, filesystem_agent_executor
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic.v1 import BaseModel, Field 
from typing import List

class ScaffoldingResponse(BaseModel):
    high_level_design: str = Field(description="A high-level overview of the application architecture, components, and user flow.")
    low_level_design: str = Field(description="Detailed schema for database models, API endpoints, and request/response structures.")
    plan: List[str] = Field(description="A step-by-step plan of agent tool calls to create the project structure and files.")

class CodeGenerationService:
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
        1.  **high_level_design**: Describe the application's architecture. What are the major components? How do they interact?
        2.  **low_level_design**: Define the specifics. If there's a database, define the table schemas. For APIs, define the endpoints (e.g., POST /api/users), and the JSON request/response bodies.
        3.  **plan**: Provide a step-by-step list of commands for the AI agent. This plan will be executed to build the project.
            - Start with a high-level tool call like `create_springboot_project` or `create_react_vite_project`.
            - Follow with low-level tool calls like `write_file` or `create_directory` to modify the base project.
            - All file paths in the plan must be relative to the project directory created in the first step (e.g., 'backend/src/...' or 'frontend/src/...').

        **Example for 'plan' (springboot):**
        ["Create a new Spring Boot project using the `create_springboot_project` tool with the `artifact_id` set to 'backend'.", "Write a new file named `backend/src/main/java/com/example/backend/model/User.java`. It should be a JPA Entity for a 'users' table.", "Write a new file named `backend/src/main/java/com/example/backend/repository/UserRepository.java`. It should be a JpaRepository interface for the User entity."]
        
        **Example for 'plan' (react):**
        ["Create a new React project using the `create_react_vite_project` tool with the `project_name` set to 'frontend'.", "Create a new directory named `frontend/src/components`.", "Write a new file named `frontend/src/components/LoginForm.jsx`.", "Overwrite the existing file named `frontend/src/App.jsx` to import and render the `LoginForm` component."]

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
            print("--- Plan Execution Finished ---")
            print(f"Final output from agent: {result.get('output', 'No output captured.')}")
            return {"success": True, "output": "Plan executed successfully."}
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

generation_service = CodeGenerationService()