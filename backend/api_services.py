import requests
import os
from dotenv import load_dotenv
from together import Together
import re

load_dotenv()

client = Together(api_key=os.getenv("TOGETHER_API_KEY"))

def summarise_text(transcript: str)->str:
    response = client.chat.completions.create(
        model = "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        messages = [{"role": "user", "content":f"Summarize this transcript:\n{transcript}"}]
    )
    
    return response.choices[0].message.content




def split_transcript(transcript: str, max_chars=1500):
    # Split into sentences (roughly)
    sentences = re.split(r'(?<=[.!?]) +', transcript)
    
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= max_chars:
            current_chunk += sentence + " "
        else:
            chunks.append(current_chunk.strip())
            current_chunk = sentence + " "

    if current_chunk:
        chunks.append(current_chunk.strip())

    print(f"Split into {len(chunks)} chunks.")
    for i, chunk in enumerate(chunks):
        print(f"Chunk {i+1} ({len(chunk)} chars): {chunk[:80]}...")

    return chunks


def make_flashcards(transcript: str)->str:
    response = client.chat.completions.create(
        model = "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        messages=[{
            "role": "user",
            "content": (
                "You are generating flashcards from a segment of a larger transcript.\n\n"
                "For this chunk:\n"
                "- Generate 4 to 7 flashcards.\n"
                "- Don't miss out on any information or analogies.\n"
                "- Each card must follow this strict format:\n"
                "  Front: [A clear question starting with What, How, Why, When, etc.]\n"
                "  Back: [A concise answer based only on this chunk]\n\n"
                "DO NOT include explanations, summaries, or other text outside the card format.\n"
                "Transcript chunk:\n"
                f"{transcript}"
            )

        }]
    )
    
    return response.choices[0].message.content


def parse_flashcards(raw_text):
    cards = []
    chunks = raw_text.strip().split("\n\n") 

    for chunk in chunks:
        lines = chunk.strip().splitlines()
        front = back = None

        for line in lines:
            if line.startswith("Front:"):
                front = line.replace("Front:", "").strip()
            elif line.startswith("Back:"):
                back = line.replace("Back:", "").strip()

        if front and back:
            cards.append({"front": front, "back": back})

    return cards


def create_flashcards_from_chunks(chunks):
    flashcards = []
    for chunk in chunks:
        raw_output = make_flashcards(chunk)
        structured = parse_flashcards(raw_output)
        if structured:  #only add cards if parsing produced valid cards
            flashcards.extend(structured)  
    return flashcards


