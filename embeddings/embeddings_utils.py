import requests
import os
import json

def get_embeddings_from_api(text_representations):
    """
    Retrieves embeddings from an external API.

    Args:
        text_representations: A list of strings to embed.

    Returns:
        A list of embeddings, or None if the API request fails.
    """
    agility_api_key = os.getenv("AGILITY_API_KEY")
    url = "http://localhost/VersionOne.Web2/api/llm/embeddings"
    headers = {
        "Authorization": f"Bearer {agility_api_key}",
        "Content-Type": "application/json"
    }
    data = json.dumps(text_representations)

    response = requests.post(url, headers=headers, data=data)

    if response.status_code == 200:
        response_json = response.json()
        return response_json["data"][0]["embedding"]  # Assuming the API returns embeddings in JSON format
    else:
        print(f"Error: API request failed with status code {response.status_code}")
        return None