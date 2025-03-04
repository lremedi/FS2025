from fastembed import TextEmbedding

class EmbeddingModels:
    nlp_model = TextEmbedding("sentence-transformers/all-MiniLM-L6-v2", threads=0)
    code_model = TextEmbedding("jinaai/jina-embeddings-v2-base-code")