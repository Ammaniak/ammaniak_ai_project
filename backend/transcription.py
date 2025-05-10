from openai import OpenAI
import os
import requests
from dotenv import load_dotenv
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def transcribe_chunk(file_path: str) -> str:
    with open(file_path, "rb") as f:
        response = requests.post(
            "https://api.openai.com/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"},
            files={"file": f},
            data={
                "model": "gpt-4o-transcribe",
                "response_format": "text",
                "chunking_strategy": "auto"
            }
        )
        if response.ok:
            return response.text
        else:
            raise Exception(f"OpenAI API error: {response.status_code} - {response.text}")


def transcribe_all_chunks(chunk_paths):
    combined_transcript = ""
    for path in chunk_paths:
        text = transcribe_chunk(path)
        combined_transcript += text + "\n"
    return combined_transcript.strip()
