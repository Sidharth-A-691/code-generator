import os
from utils.llms import model, filesystem_agent_executor 
from langchain_core.prompts import ChatPromptTemplate

class CodeGenerationService:
    def _create_planning_prompt(self, user_stories: str, project_type: str, language: str) -> str:
        """Creates the detailed prompt for the planning LLM (Azure OpenAI)."""
        
        template = """
        You are a world-class Solution Architect. Your task is to produce a scaffolding plan for an AI agent.

        **Input Details:**
        - User Stories: {user_stories}
        - Project Type: {project_type}
        - Language/Framework: {language}

        ### SCAFFOLDING PLAN ###
        Your plan should be a series of steps for the agent to execute.

        **HIGH-LEVEL TOOLS (Use these first):**
        - For Spring Boot, your FIRST step should be `create_springboot_project`. You can specify the `artifact_id`.
        - For React, your FIRST step should be `create_react_vite_project`. You must specify the `project_name`.

        **LOW-LEVEL TOOLS (Use these for modifications):**
        - After creating the initial project, use tools like `write_file` to add new code or modify existing files.
        - Use `create_directory` for any new folders needed. All file paths must be relative to the project directory created in step 1.

        **Example for SCAFFOLDING PLAN (springboot):**
        1. Create a new Spring Boot project using the `create_springboot_project` tool with the `artifact_id` set to 'backend'.
        2. Write a new file named `backend/src/main/java/com/example/backend/model/User.java`. It should be a JPA Entity for a "users" table.
        3. Write a new file named `backend/src/main/java/com/example/backend/repository/UserRepository.java`. It should be a JpaRepository interface for the User entity.
        
        **Example for SCAFFOLDING PLAN (react):**
        1. Create a new React project using the `create_react_vite_project` tool with the `project_name` set to 'frontend'.
        2. Create a new directory named `frontend/src/components`.
        3. Write a new file named `frontend/src/components/LoginForm.jsx`. It should be a React component with a login form.
        4. Overwrite the existing file named `frontend/src/App.jsx` to import and render the `LoginForm` component.
        """
        prompt = ChatPromptTemplate.from_template(template)
        chain = prompt | model
        result = chain.invoke({
            "user_stories": user_stories,
            "project_type": project_type,
            "language": language
        })
        return result.content
    
    def _execute_plan(self, plan: str, output_directory: str):
        """
        Executes the scaffolding plan using the filesystem_agent_executor.
        This method remains the same as before.
        """
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
        {plan}
        --- END PLAN ---
        """

        try:
            result = filesystem_agent_executor.invoke({
                "input": execution_prompt
            })
            
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
        This method remains the same.
        """
        
        print("Step 1: Generating Scaffolding Plan from Azure OpenAI...")
        full_plan = self._create_planning_prompt(user_stories, project_type, language)
        print("Plan received from Azure OpenAI:")
        print(full_plan)

        print("\nStep 2: Handing off Scaffolding Plan to Agent for execution...")
        result = self._execute_plan(full_plan, output_directory)
        
        return result

generation_service = CodeGenerationService()