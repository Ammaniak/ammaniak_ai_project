import datetime
import numpy as np
from openai import OpenAI
import os
import requests
from dotenv import load_dotenv
from pydub import AudioSegment
from pydub.silence import split_on_silence

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def process_chunks(chunks, min_chunk_size):
    sec_in_chunk = 0
    combined_chunk = AudioSegment.empty()
    final_chunks = []

    for chunk in chunks:
        sec_in_chunk += len(chunk) / 1000
        combined_chunk += chunk

        if sec_in_chunk >= min_chunk_size:
            final_chunks.append(combined_chunk)
            sec_in_chunk = 0
            combined_chunk = AudioSegment.empty()

    if len(combined_chunk) > 0:
        final_chunks.append(combined_chunk)

    return final_chunks


def save_chunks(chunks, og_file_time):
    project_dir = os.getcwd();
    chunks_path = os.path.join(project_dir, "chunks")

    if not os.path.exists(chunks_path):
        os.makedirs(chunks_path)

    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    chunks_sub_folder_path = os.path.join(chunks_path, f"chunks_{timestamp}")
    if not os.path.exists(chunks_sub_folder_path):
        os.makedirs(chunks_sub_folder_path)

    chunk_file_names =[]
    for i, chunk in enumerate(chunks, start=1):
        chunk_path = os.path.join(chunks_sub_folder_path, f"chunk_{i}.wav")
        chunk.export(chunk_path, format="wav")
        chunk_file_names.append(chunk_path)

    return chunk_file_names


def get_chunks(file_path):
    start_time = datetime.datetime.now()
    min_chunk_size = 10

    ext = os.path.splitext(file_path)[-1].lower().replace(".", "")
    print(f"[DEBUG] Inferred file format: {ext}")

    try:
        audio_file = AudioSegment.from_file(file_path, format=ext)
        print("Duration (sec):", len(audio_file) / 1000)
        print("dBFS:", audio_file.dBFS)
    except Exception as e:
        print(f"Audio decoding error: {e}")
        raise e

    silence_thresh = audio_file.dBFS - 10

    chunks = split_on_silence(
        audio_file, 
        min_silence_len=1000,         # Lowered from 800
        silence_thresh=silence_thresh,
        keep_silence=500             # Keep some silence padding
    )

    if len(chunks) == 0:
        print("[WARN] No silence-based chunks found. Using fallback chunking.")
        chunks = [audio_file[i:i+30000] for i in range(0, len(audio_file), 60000)]


    processed_chunks = process_chunks(chunks, min_chunk_size)

    end_time = datetime.datetime.now();

    processing_time = (end_time - start_time).total_seconds()

    print(f"Chunking took {processing_time} seconds")
    
    chunk_file_names = save_chunks(processed_chunks, audio_file.duration_seconds)
    return {
        "final_chunks": processed_chunks,
        "file_names": chunk_file_names
    }


def transcribe_all_chunks(chunk_paths):
    transcripts = []

    for chunk_path in chunk_paths:
        try:
            with open(chunk_path, "rb") as audio_file:
                response = client.audio.transcriptions.create(
                    model="gpt-4o-transcribe",
                    file=audio_file,
                    response_format="text"
                )
                transcripts.append(response.strip())
        except Exception as e:
            print(f"Error transcribing {chunk_path}: {e}")

    return "\n".join(transcripts)
