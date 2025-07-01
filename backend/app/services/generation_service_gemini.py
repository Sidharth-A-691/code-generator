# app/services/generation_service.py

#Note: This code appears to be very slow while the gemini cli runs

import subprocess
import os
from utils.llms import model 
from langchain_core.prompts import ChatPromptTemplate

class CodeGenerationService:
    def _create_planning_prompt(self, user_stories: str, project_type: str, language: str) -> str:
        """Creates the detailed prompt for the planning LLM (Azure OpenAI)."""
        
        template = """
        You are a world-class Solution Architect. Your task is to analyze user stories and produce a file-based scaffolding plan for an AI agent. The agent will start in an empty directory.

        **Input Details:**
        - User Stories: {user_stories}
        - Project Type: {project_type}
        - Language/Framework: {language}

        ### SCAFFOLDING PLAN ###
        (This is the most important part. Create a clear, step-by-step plan that ONLY involves creating directories and writing new files with code. Do NOT include commands like `mvn`, `npm`, or `git`. The AI agent is smart enough to generate complete, high-quality code from a description of the file's purpose.)

        **Example for SCAFFOLDING PLAN (springboot):**
        1. Create a directory named `backend`.
        2. Write a new file named `backend/src/main/java/com/example/api/model/User.java`. The file should contain a `User` class as a JPA Entity for a "users" table, with fields for id (Long), username (String), email (String), and password (String).
        3. Write a new file named `backend/src/main/java/com/example/api/repository/UserRepository.java`. The file should contain a `UserRepository` interface that extends `JpaRepository<User, Long>`.
        4. Write a new file named `backend/src/main/java/com/example/api/controller/UserController.java`. The file should contain a `UserController` class with a `@RestController` annotation and a `@RequestMapping("/api/users")`. It needs a POST endpoint for `/register` that accepts a user DTO and uses a service to create the user.
        5. Write a new file named `backend/pom.xml`. The file should contain the necessary Maven dependencies for a Spring Boot application with Spring Web and Spring Data JPA.

        **Example for SCAFFOLDING PLAN (react):**
        1. Create a directory named `frontend`.
        2. Create a directory named `frontend/src/components`.
        3. Write a new file named `frontend/src/components/LoginForm.jsx`. The file should contain a React functional component with a form, state for email and password fields, and a submit button.
        4. Write a new file named `frontend/src/App.jsx`. The file should import and render the `LoginForm` component.
        5. Write a new file named `frontend/package.json`. The file should contain the necessary dependencies for a React + Vite project, including `react`, `react-dom`, and `vite`.
        """
        prompt = ChatPromptTemplate.from_template(template)
        chain = prompt | model
        result = chain.invoke({
            "user_stories": user_stories,
            "project_type": project_type,
            "language": language
        })
        return result.content
    
    def _execute_gemini_cli(self, plan: str, output_directory: str):
        """Creates a prompt.txt file and then executes the gemini-cli agent."""

        if not os.path.exists(output_directory):
            os.makedirs(output_directory)
            print(f"Created directory: {output_directory}")

        prompt_file_path = os.path.join(output_directory, "prompt.txt")
        print(f"Writing scaffolding plan to {prompt_file_path}...")
        try:
            with open(prompt_file_path, "w", encoding="utf-8") as f:
                f.write(plan)
            print("Plan written successfully.")
        except Exception as e:
            print(f"FATAL: Failed to write plan to {prompt_file_path}: {e}")
            raise

        gemini_executable_path = "C:\\Users\\287960\\AppData\\Roaming\\npm\\gemini.cmd"
        
        cli_prompt = "execute_the_plan"
        
        command = [gemini_executable_path, "-y", "-a", "-p", cli_prompt]

        process_env = os.environ.copy()
        process_env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
        
        print(f"Executing Gemini CLI in directory: {output_directory}")
        print("Note: Running with NODE_TLS_REJECT_UNAUTHORIZED=0...")
        print("--- START OF GEMINI CLI REAL-TIME OUTPUT ---")

        try:
            process = subprocess.Popen(
                command,
                cwd=output_directory,
                env=process_env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding="utf-8",
                errors="replace",
                bufsize=1
            )

            for line in process.stdout:
                print(line, end='')
            
            process.wait()
            
            if process.returncode != 0:
                error_output = process.stderr.read()
                print("--- GEMINI CLI ERROR ---")
                print(error_output)
                raise subprocess.CalledProcessError(
                    returncode=process.returncode,
                    cmd=command,
                    stderr=error_output
                )
            
            print("\n--- END OF GEMINI CLI REAL-TIME OUTPUT ---")
            print("Gemini CLI execution successful.")
            return {"success": True, "output": "Process completed successfully."}

        except FileNotFoundError:
            print(f"ERROR: The command executable was not found at the specified path: {gemini_executable_path}")
            raise
        except subprocess.CalledProcessError as e:
            print(f"ERROR: Gemini CLI returned a non-zero exit code: {e.returncode}")
            print("STDERR:", e.stderr)
            raise e

    def generate_application(self, user_stories: str, project_type: str, language: str, output_directory: str):
        """Main method to orchestrate the generation process."""
        
        print("Step 1: Generating Scaffolding Plan from Azure OpenAI...")
        full_plan = self._create_planning_prompt(user_stories, project_type, language)
        print("Plan received from Azure OpenAI.")
        print(full_plan)

        print("\nStep 2: Handing off Scaffolding Plan to Gemini CLI for execution...")
        result = self._execute_gemini_cli(full_plan, output_directory)
        
        return result

generation_service = CodeGenerationService()