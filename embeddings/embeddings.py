import json
import os
from tqdm import tqdm
from fastembed import TextEmbedding
from qdrant_client import QdrantClient, models
from config import COLLECTION_NAME
from embeddings_utils import get_embeddings_from_api  # Import the function
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
API_KEY = os.getenv("API_KEY")


# Load the JSON data
with open('../resources/data.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Extract the code snippets
text_representations = [item['explanation'] for item in data]
code_snippets = [structure["codeSnippet"] for structure in data]

batch_size = 5

# nlp_model = TextEmbedding("sentence-transformers/all-MiniLM-L6-v2", threads=0)
# nlp_embeddings = nlp_model.embed(text_representations, batch_size=batch_size)

# code_model = TextEmbedding("jinaai/jina-embeddings-v2-base-code")
# code_embeddings = code_model.embed(code_snippets, batch_size=batch_size)

nlp_embeddings = [get_embeddings_from_api(text) for text in text_representations]
code_embeddings = [get_embeddings_from_api(code) for code in code_snippets]


points = []
total = len(data)
print("Number of points to upload: ", total)
client = QdrantClient(url=DATABASE_URL, api_key=API_KEY)

# client.delete_collection(COLLECTION_NAME)

client.create_collection(
    COLLECTION_NAME,
    vectors_config={
        "text": models.VectorParams(
            size=1024,
            distance=models.Distance.COSINE,
        ),
        "code": models.VectorParams(
            size=1024,
            distance=models.Distance.COSINE,
        ),
    },
)

for id, (text_embedding, code_embedding, structure) in tqdm(
    enumerate(zip(nlp_embeddings, code_embeddings, data)), total=total
):
    # FastEmbed returns generators. Embeddings are computed as consumed.
    points.append(
        models.PointStruct(
            id=id,
            vector={
                "text": text_embedding,
                "code": code_embedding,
            },
            payload=structure["payload"],
        )
    )

    # Upload points in batches
    if len(points) >= batch_size:
        client.upload_points(COLLECTION_NAME, points=points, wait=True)
        points = []

# Ensure any remaining points are uploaded
if points:
    client.upload_points(COLLECTION_NAME, points=points)

print(f"Total points in collection: {client.count(COLLECTION_NAME).count}")