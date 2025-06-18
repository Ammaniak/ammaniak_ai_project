# AI Transcription Project Documentation

## Last Updated: 2025-06-17 23:09

---

## Project Summary

This app helps users study more effectively by allowing them to:

1. Upload audio files (e.g., lectures, podcasts),
2. Generate accurate transcriptions,
3. Automatically create flashcards from the content,
4. Review flashcards using a spaced repetition system (SM2),
5. Log user interactions and train a machine learning model to adapt review intervals.

---

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Flask, Python
- **Database**: PostgreSQL
- **Machine Learning**: Scikit-learn
- **Storage**: Local files (for audio and model)
- **AI Services**: OpenAI API

---

## Features & Implementation

### 1. **User Authentication**

- Basic login via `POST /login`
- Creates or fetches users using their `username` and `email`
- Returns a `user_id` stored in `localStorage`

### 2. **Transcription**

- Route: `POST /upload`
- Accepts `.wav` file + `user_id`
- Uses Whisper/OpenAI to transcribe
- Stores result in `transcripts` table with:
  - `id`, `user_id`, `content`, `created_at`

### 3. **Flashcard Generation**

- Route: `POST /flashcards`
- Splits transcript into chunks
- Sends chunks to OpenAI to generate Q&A pairs
- Stores cards in `flashcards` table with:
  - `id`, `transcript_id`, `front`, `back`, `easiness_factor`, `repetitions`, `interval`, `due_date`

### 4. **Flashcard Viewer**

- Component: `FlashcardViewer.tsx`
- Allows users to:
  - Flip cards (counted)
  - Rate difficulty (1–5)
- Fetches cards due for review: `GET /study/<user_id>`

### 5. **Flashcard Interaction Logging**

- Route: `POST /flashcard_interactions`
- Logs:
  - `flashcard_id`, `user_id`, `flips`, `time_spent_seconds`, `difficulty_rating`, `start_time`
- Updates flashcard SM2 values unless overridden by model

### 6. **Spaced Repetition (SM2)**

- Implemented directly in backend
- Adjusts:
  - `easiness_factor`, `repetitions`, `interval`, `due_date`
- Based on interaction rating

### 7. **ML Model Training**

- Trained with:
  - `flips`, `time_spent_seconds`, `difficulty_rating`
- Predicts `easiness_factor`
- Stored at: `backend/models/easiness_predictor.pkl`

### 8. **ML Integration (in progress)**

- Will override SM2 EF if model is loaded and returns valid prediction
- Model used in `/flashcard_interactions` to dynamically compute EF

---

## Database Schema

### `users`

```sql
id SERIAL PRIMARY KEY,
email VARCHAR(120) UNIQUE NOT NULL,
username VARCHAR(80) UNIQUE NOT NULL
```

### `transcripts`

```sql
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id),
content TEXT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### `flashcards`

```sql
id SERIAL PRIMARY KEY,
transcript_id INTEGER REFERENCES transcripts(id),
front TEXT NOT NULL,
back TEXT NOT NULL,
easiness_factor FLOAT DEFAULT 2.5,
repetitions INTEGER DEFAULT 0,
interval INTEGER DEFAULT 1,
due_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### `flashcard_interactions`

```sql
id SERIAL PRIMARY KEY,
flashcard_id INTEGER REFERENCES flashcards(id),
user_id INTEGER REFERENCES users(id),
flips INTEGER NOT NULL,
time_spent_seconds INTEGER,
difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
interaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## Model Code (simplified)

```python
df = pd.read_csv("backend/data/flashcardints.csv")
X = df[["flips", "time_spent_seconds", "difficulty_rating"]]
y = df["easiness_factor"]

model = LinearRegression()
model.fit(X_train, y_train)

joblib.dump(model, "backend/models/easiness_predictor.pkl")
```

---

## Directory Structure (key files only)

```
backend/
├── app.py
├── models/
│   └── easiness_predictor.pkl
├── data/
│   └── flashcardints.csv
├── templates/
└── ...
frontend/
├── components/
│   └── flashcards.tsx
│   └── DueCards.tsx
├── service/
│   └── flashcardsService.tsx
└── pages/
```

---

## To-Do / Future Ideas4

- [ ] Let users manually edit flashcards
- [ ] Export flashcards or notes
- [ ] Analytics dashboard for review patterns
