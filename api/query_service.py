from qdrant_client import QdrantClient
from qdrant_client.http.models import models
from embedding_models import EmbeddingModels
from config import COLLECTION_NAME
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
API_KEY = os.getenv("API_KEY")

def query(query):
    client = QdrantClient(url=DATABASE_URL, api_key=API_KEY)

    print("Querying the database...")
    print("Query: ", query)

    hits = client.query_points(
        collection_name=COLLECTION_NAME,
        prefetch=[
            models.Prefetch(
                query=next(EmbeddingModels.nlp_model.query_embed(query)).tolist(),
                using="text",
                limit=5,
            ),
            models.Prefetch(
                query=next(EmbeddingModels.code_model.query_embed(query)).tolist(),
                using="code",
                limit=5,
            ),
        ],
        query=models.FusionQuery(fusion=models.Fusion.RRF),
    ).points

    hits_dict = [{'payload': hit.payload, 'score': hit.score} for hit in hits]

    # return json.dumps(hits_dict)
    return hits_dict