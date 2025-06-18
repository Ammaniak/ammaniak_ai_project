from datetime import datetime, timedelta
import os
from flask import Flask, request, jsonify
from openai import OpenAI
import psycopg2
from api_services.chatbot import chatbot_with_context
from api_services.flashcards_summaries import create_flashcards_from_chunks, make_flashcards, parse_flashcards, split_transcript, summarise_text
from api_services.transcription import get_chunks, transcribe_all_chunks
from flask_cors import CORS
import io
import tempfile
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import joblib
import numpy as np
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


conn = psycopg2.connect(
    dbname="transcription_app",
    user="postgres",
    password="pakistan01",
    host="localhost",
    port=5435
)
cursor = conn.cursor()

model_path = os.path.join(os.path.dirname(__file__), "models", "easiness_predictor.pkl")
model = joblib.load(model_path)

#flashcard study tools
@app.route("/flashcard_interactions", methods=["POST"])
def log_flashcard_interaction():
    data = request.get_json()
    flashcard_id = data["flashcard_id"]
    user_id = data["user_id"]
    flips = data["flips"]
    time_spent = data["time_spent_seconds"]
    difficulty = data["difficulty_rating"]

    # Insert the interaction log
    cursor.execute("""
        INSERT INTO flashcard_interactions (flashcard_id, user_id, flips, time_spent_seconds, difficulty_rating)
        VALUES (%s, %s,%s, %s, %s)
    """, (flashcard_id, user_id, flips, time_spent, difficulty))

    # Fetch current flashcard data
    cursor.execute("""
        SELECT easiness_factor, repetitions, interval FROM flashcards
        WHERE id = %s
    """, (flashcard_id,))
    result = cursor.fetchone()
    ef, reps, interval = result or (2.5, 0, 1)
    features = np.array([[flips, time_spent, difficulty, ef, reps]])
    try:
        predicted_interval = int(model.predict(features)[0])
        interval = max(1, predicted_interval)
    except Exception as e:
        print("Prediction error:", str(e))

    # SM2 algorithm
        if difficulty < 3:
            reps = 0
            interval = 1
        else:
            reps += 1
            if reps == 1:
                interval = 1
            elif reps == 2:
                interval = 6
            else:
                interval = round(interval * ef)

            ef = ef + (0.1 - (5 - difficulty) * (0.08 + (5 - difficulty) * 0.02))
            if ef < 1.3:
                ef = 1.3

    # Calculate due date
    due_date = datetime.now() + timedelta(days=interval)

    

    due_date = datetime.now() + timedelta(days=interval)

    cursor.execute("""
        UPDATE flashcards
        SET easiness_factor = %s,
            repetitions = %s,
            interval = %s,
            due_date = %s
        WHERE id = %s
    """, (ef, reps, interval, due_date, flashcard_id))

    conn.commit()

    return jsonify({"message": "Interaction logged and flashcard updated"})

@app.route("/study/<int:user_id>", methods=["GET"])
def get_due_flashcards(user_id):
    now = datetime.now()
    cursor.execute("""
        SELECT f.id, f.front, f.back FROM flashcards f
        JOIN transcripts t ON f.transcript_id = t.id
        WHERE t.user_id = %s AND f.due_date <= %s
    """, (user_id, now))
    rows = cursor.fetchall()
    flashcards = [{"id": r[0], "front": r[1], "back": r[2]} for r in rows]
    return jsonify(flashcards)

@app.route("/flashcards/<int:transcript_id>", methods=["GET"])
def get_flashcards(transcript_id):
    cursor.execute("SELECT id, front, back FROM flashcards WHERE transcript_id = %s", (transcript_id,))
    rows = cursor.fetchall()
    flashcards = [{"id":r[0], "front": r[1], "back": r[2]} for r in rows]
    return jsonify(flashcards)

# fetching transcripts

@app.route("/transcriptdetails/<int:transcript_id>", methods=["GET"])
def get_transcript_details(transcript_id):
    cursor.execute("SELECT id, content, created_at FROM transcripts WHERE id = %s", (transcript_id,))
    row = cursor.fetchone()
    if row:
        result = {
            "id": row[0],
            "content": row[1],
            "created_at": row[2].isoformat()
        }
        return jsonify(result)

@app.route("/transcripts/<int:user_id>", methods=["GET"])
def get_transcripts(user_id):
    cursor.execute("SELECT id, content, created_at FROM transcripts WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
    rows = cursor.fetchall()
    result = [{"id": r[0], "content": r[1], "created_at": r[2].isoformat()} for r in rows]
    return jsonify(result)

@app.route("/login", methods=["POST"])
def login_user():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")

    if not username or not email:
        return jsonify({"error": "Username and email required"}), 400

    cursor.execute("SELECT id FROM users WHERE username = %s AND email = %s", (username, email))
    user = cursor.fetchone()

    if user:
        user_id = user[0]
    else:
        cursor.execute("INSERT INTO users (username, email) VALUES (%s, %s)  RETURNING id", (username, email))
        user_id = cursor.fetchone()[0]
        conn.commit()

    return jsonify({"user_id": user_id})



# study tools basic functionality
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
    user_id = data.get("user_id")
    
    if not transcript or not user_id:
        return jsonify({"error": "Transcript and user ID required"}), 400

    cursor.execute(
        "INSERT INTO transcripts (user_id, content) VALUES (%s, %s) RETURNING id",
        (user_id, transcript)
    )
    transcript_id = cursor.fetchone()[0]
    conn.commit()

    max_chars = 1500
    chunks = split_transcript(transcript, max_chars)
    flashcards = create_flashcards_from_chunks(chunks)

    for card in flashcards:
        cursor.execute(
            """
            INSERT INTO flashcards (transcript_id, front, back)
            VALUES (%s, %s, %s)
            """,
            (transcript_id, card["front"], card["back"])
        )
    
    conn.commit()
    cursor.execute("SELECT id, front, back FROM flashcards WHERE transcript_id = %s", (transcript_id,))
    rows = cursor.fetchall()
    flashcards = [{"id": r[0], "front": r[1], "back": r[2]} for r in rows]

    return jsonify({"flashcards": flashcards})
    


@app.route("/chatbot", methods=["POST"])
def chatbot_route():
    data = request.get_json()
    front = data.get("front")
    transcript = data.get("transcript")

    if not front or not transcript:
        return jsonify({"error": "Missing transcript or front"}), 400

    back, _ = chatbot_with_context(front, transcript)
    return jsonify({"back": back})

@app.route("/upload", methods=['POST', 'OPTIONS'])
def upload_audio():
    try:
        user_id = request.form.get("user_id")

        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        
        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400
        print("File received:", file.filename)
        print("Uploaded file type:", file.content_type)

        
        filename = secure_filename(file.filename)
        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, filename)
        file_bytes = file.read()
        with open(file_path, "wb") as f:
            f.write(file_bytes)

        chunk_data = get_chunks(file_path)
        if not chunk_data:
            return jsonify({"error": "No audio chunks found"}), 400
        chunk_paths = chunk_data['file_names']
        final_chunks = chunk_data["final_chunks"]

        transcript  = transcribe_all_chunks(chunk_paths)
        print("Transcription complete. Number of chunks:", len(final_chunks))
        cursor.execute(
            """
            INSERT INTO transcripts (user_id, content)
            VALUES (%s, %s) RETURNING id
            """,
            (user_id, transcript)
        )
        conn.commit()
        return jsonify({"transcription": transcript.strip()})
    
    
        
    except Exception as e:
        print("Upload error:", str(e))
        return jsonify({"error": "Server error: " + str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5050)
