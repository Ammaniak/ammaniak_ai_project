import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
import joblib
from sklearn.metrics import mean_squared_error
import os


df = pd.read_csv("/Users/ammaniak/Documents/AdvancedAi/ammaniak_ai_project/backend/data/flashcardints.csv")

X = df[["flips", "time_spent_seconds", "difficulty_rating"]]
y = df["easiness_factor"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LinearRegression()
model.fit(X_train, y_train)

joblib.dump(model, "models/easiness_predictor.pkl")
print("Model saved at:", os.path.abspath("backend/models/easiness_predictor.pkl"))

y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
print("Test MSE:", mse)