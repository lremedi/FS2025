**📊 Agility-Driven Code Integration**

---

## 🎯 **Project Goal**
To enhance the link between Agility Tasks and code by leveraging code indexing, embedding models, and LLMs to suggest relevant code changes.

---

## 🛠️ **Technologies Used**
- **LSIF (Language Server Index Format)**: Extracts and indexes code snippets from the codebase.
- **LLM Agent**: Generates descriptions for extracted code snippets.
- **Embedding Models**:
  - **AWS Titan**: Generates embeddings for raw code snippets and descriptions.
- **Qdrant (Vector Database)**: Stores vector embeddings for efficient retrieval.
- **Vector Search**: Finds relevant code snippets based on task descriptions.
- **LLM Contextualization**: Uses retrieved snippets and task details to propose code changes/additions.

---

## 🔄 **Workflow**

### 1️⃣ LSIF Indexing
- **Language Agnostic**: LSIF can be used across multiple [programming languages](https://microsoft.github.io/language-server-protocol/implementors/servers/), making it a versatile choice for indexing code in diverse codebases.
- Extracts code snippets from the repository.
- Code: `npm run generate-lsif` from https://github.com/lremedi/FS2025/tree/main/snippets to generate codebase graph using https://github.com/microsoft/lsif-node
- Code: `npm run extract-snippets` from https://github.com/lremedi/FS2025/tree/main/snippets to extract code snippets and its metadata like language, line from/to and file name.

### 2️⃣ LLM Code Snippet Description
- Each extracted snippet is processed by an LLM to generate a natural language description.
- Code: `npm run analyze-snippets` from https://github.com/lremedi/FS2025/tree/main/snippets to generate a description using https://api.staging.digital.ai/llm/docs#/default/chat_completions_chat_completions_post and model `anthropic.claude-3-5-sonnet-20241022-v2:0`

### 3️⃣ Vectorization of Code & Descriptions
- The raw code snippets and descriptions are embedded using **AWS Titan**.
- Code: `embeddings.py` from https://github.com/lremedi/FS2025/tree/main/embeddings to generate embeddings for code snippets and descriptions, and then pushed to QDrant collection using https://api.staging.digital.ai/llm/docs#/default/embeddings_embeddings_post and model `amazon.titan-embed-text-v2:0` through Agility API endpoint.

### 4️⃣ Storage in Qdrant
- Both sets of embeddings (code and descriptions) are stored in **Qdrant**, a vector database.

### 5️⃣ Task-Based Code Retrieval
- Agility task descriptions are embedded and used to search the Qdrant database.
- The most relevant code snippets are retrieved.
- Using QDrant client for .Net Framework (internally using gRPC).

### 6️⃣ Contextualization & Code Suggestions
- The retrieved code snippets, task description, and related story/defect descriptions are provided as context to an LLM.
- The LLM generates **suggested code changes or additions** based on the retrieved context.

---

## 📌 **Expected Benefits**
- **Faster Code Discovery**: Developers can quickly find relevant code based on task descriptions.
- **Context-Aware Code Suggestions**: The system recommends relevant changes/additions based on Agility tasks.
- **Automation of Agile-to-Code Workflow**: Reduces manual effort in mapping tasks to code changes.
- **Improved Development Efficiency**: Bridges the gap between planning and implementation.

---

## 🚀 **Conclusion**
This project enhances Agile development by integrating tasks directly with code, enabling AI-assisted coding and improving overall efficiency. By leveraging LSIF, embeddings, and LLMs, we automate the connection between Agile workflows and coding activities.

