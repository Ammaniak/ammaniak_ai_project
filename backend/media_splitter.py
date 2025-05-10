from pydub import AudioSegment
import math
import os

def convert_to_wav(input_path, output_path):
    audio = AudioSegment.from_file(input_path)
    audio.export(output_path, format="wav")



def split_audio_wav(file_path, chunk_length_sec=1500):
    audio = AudioSegment.from_wav(file_path)
    duration_ms = len(audio)
    chunk_length_ms = chunk_length_sec * 1000

    num_chunks = math.ceil(duration_ms / chunk_length_ms)
    base_name = os.path.splitext(os.path.basename(file_path))[0]
    dir_name = os.path.dirname(file_path)

    chunk_paths = []

    for i in range(num_chunks):
        start = i * chunk_length_ms
        end = min((i + 1) * chunk_length_ms, duration_ms)
        chunk = audio[start:end]

        chunk_path = os.path.join(
            dir_name, f"{base_name}_chunk_{i + 1}.wav"
        )
        chunk.export(chunk_path, format="wav")
        chunk_paths.append(chunk_path)

    print("Chunk paths:", chunk_paths)
    return chunk_paths
