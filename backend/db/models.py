import psycopg2

conn = psycopg2.connect(
    dbname="transcription_app",
    user="postgres",
    password="pakistan01",
    host="localhost",
    port=5435
)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    username VARCHAR(80) UNIQUE NOT NULL
);
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS transcripts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS flashcards (
    id SERIAL PRIMARY KEY,
    transcript_id INTEGER REFERENCES transcripts(id),
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    easiness_factor FLOAT DEFAULT 2.5,
    repetitions INTEGER DEFAULT 0,
    interval INTEGER DEFAULT 1,
    due_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""")
cursor.execute("""
CREATE TABLE IF NOT EXISTS flashcard_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    flashcard_id INTEGER REFERENCES flashcards(id),
    flips INTEGER NOT NULL DEFAULT 0,
    time_spent_seconds INTEGER NOT NULL,
    difficulty_rating VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""")

conn.commit()
cursor.close()
conn.close()