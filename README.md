# Agility-Driven Code Integration

## 🎯 Project Goal
To enhance the link between Agility tasks that are a part (children of) Stories and Defects and code by leveraging code indexing, embedding models, and LLMs to suggest relevant code changes.

## 🛠️ Technologies Used
- **LSIF (Language Server Index Format)** → Extracts and indexes code snippets from the codebase.
- **LLM Agent** → Generates descriptions for extracted code snippets.
- **Embedding Models**:
  - **jinaai/jina-embeddings-v2-base-code**: Vectorizes raw code snippets.
  - **sentence-transformers/all-MiniLM-L6-v2**: Vectorizes snippet descriptions.
- **Qdrant (Vector Database)** → Stores vector embeddings for efficient retrieval.
- **Cosine Similarity Search** → Finds relevant code snippets based on task descriptions.
- **LLM Contextualization** → Uses retrieved snippets and Agile task details to propose code changes/additions.

---

## 🔄 Workflow

1. **LSIF Indexing**
   - Extracts code snippets from the repository.

2. **LLM Code Snippet Description**
   - Each extracted snippet is processed by an LLM to generate a natural language description.

3. **Vectorization of Code & Descriptions**
   - The raw code snippets are embedded using **jinaai/jina-embeddings-v2-base-code**.
   - The corresponding descriptions are embedded using **sentence-transformers/all-MiniLM-L6-v2**.

4. **Storage in Qdrant**
   - Both sets of embeddings (code and descriptions) are stored in **Qdrant**, a vector database.

5. **Task-Based Code Retrieval**
   - Agility task descriptions are embedded and used to search the Qdrant database via **cosine similarity**.
   - The most relevant code snippets are retrieved.

6. **Contextualization & Code Suggestions**
   - The retrieved code snippets, the task description, and related story/defect descriptions are provided as context to an LLM.
   - The LLM generates **suggested code changes or additions** based on the retrieved context.

---

## 📌 Expected Benefits
- **Faster Code Discovery**: Developers can quickly find relevant code based on task descriptions.
- **Context-Aware Code Suggestions**: The system recommends relevant changes/additions based on Agile tasks.
- **Automation of Agile-to-Code Workflow**: Reduces manual effort in mapping tasks to code changes.
- **Improved Development Efficiency**: Bridges the gap between planning and implementation.

---

## 🚀 Conclusion
This project enhances Agile development by integrating tasks directly with code, enabling AI-assisted coding and improving overall efficiency. By leveraging LSIF, embeddings, and LLMs, we automate the connection between Agile workflows and coding activities.
