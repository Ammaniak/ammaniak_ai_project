import os
from flask import Flask, request, jsonify
from openai import OpenAI
from chatbot import chatbot_with_context
from api_services import create_flashcards_from_chunks, make_flashcards, parse_flashcards, split_transcript, summarise_text
from flask_cors import CORS
import io
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

#API route
@app.route("/summarise", methods=["POST"])
def summarise_route():
    data = request.get_json()
    transcript = data.get("transcript")
    
    if not transcript:
        return jsonify({"error": "No transcript provided"}), 400

    summary = summarise_text(transcript)
    return jsonify({"summary": summary})

@app.route("/flashcards", methods=["POST"])
def flashcards_route():
    data = request.get_json()
    transcript = data.get("transcript")
    
    if not transcript:
        return jsonify({"error": "No transcript provided"}), 400
    
    max_chars = 1500
    chunks = split_transcript(transcript, max_chars)
    flashcards = create_flashcards_from_chunks(chunks)
    
    return jsonify({"flashcards": flashcards})

@app.route("/chatbot", methods=["POST"])
def chatbot_route():
    data = request.get_json()
    question = data.get("question")
    transcript = data.get("transcript")

    if not question or not transcript:
        return jsonify({"error": "Missing transcript or question"}), 400

    answer, _ = chatbot_with_context(question, transcript)
    return jsonify({"answer": answer})

@app.route("/upload", methods=['POST', 'OPTIONS'])
def upload_audio():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400

        print("File received:", file.filename)
        print("Uploaded file type:", file.content_type)

        # Read into BytesIO
        file_bytes = file.read()
        file_stream = io.BytesIO(file_bytes)

        # Provide filename to help OpenAI infer type
        transcription = client.audio.transcriptions.create(
            model="gpt-4o-transcribe",
            file=(file.filename, file_stream, file.content_type),
            response_format='text',
        )

        return jsonify({"transcription": transcription})

    except Exception as e:
        print("Upload error:", str(e))
        return jsonify({"error": "Server error: " + str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5050)
