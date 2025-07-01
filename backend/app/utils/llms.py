from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings 
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from utils.config import settings
from tools.filesystem import tools as filesystem_tools

# Azure OpenAI configuration
AZURE_OPENAI_ENDPOINT = settings.AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_API_KEY = settings.AZURE_OPENAI_API_KEY
AZURE_OPENAI_API_VERSION = settings.AZURE_OPENAI_API_VERSION
AZURE_OPENAI_DEPLOYMENT = settings.AZURE_OPENAI_DEPLOYMENT

# Azure OpenAI Embeddings configuration
AZURE_OPENAI_EMBED_API_ENDPOINT = settings.AZURE_OPENAI_EMBED_API_ENDPOINT
AZURE_OPENAI_EMBED_API_KEY = settings.AZURE_OPENAI_EMBED_API_KEY
AZURE_OPENAI_EMBED_MODEL = settings.AZURE_OPENAI_EMBED_MODEL
AZURE_OPENAI_EMBED_VERSION = settings.AZURE_OPENAI_EMBED_VERSION

# Initialize Azure OpenAI model
model = AzureChatOpenAI(
    azure_deployment=AZURE_OPENAI_DEPLOYMENT,
    openai_api_version=AZURE_OPENAI_API_VERSION,
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_key=AZURE_OPENAI_API_KEY,
)

# Initialize Azure OpenAI Embeddings
embedding_model = AzureOpenAIEmbeddings(
    deployment=AZURE_OPENAI_EMBED_MODEL,
    openai_api_version=AZURE_OPENAI_EMBED_VERSION,
    azure_endpoint=AZURE_OPENAI_EMBED_API_ENDPOINT,
    api_key=AZURE_OPENAI_EMBED_API_KEY,
)

tools = filesystem_tools

agent_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are an AI agent that executes a plan using filesystem tools. You are running inside the project's output directory. Execute the user's plan step-by-step."),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
agent = create_openai_tools_agent(model, tools, agent_prompt)

filesystem_agent_executor = AgentExecutor(
    agent=agent, 
    tools=tools, 
    verbose=True
)
