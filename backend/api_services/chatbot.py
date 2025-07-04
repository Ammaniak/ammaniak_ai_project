import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

#current question, transcript and history is passed
def chatbot_with_context(question, transcript, history=None):
    system_prompt = (
        "You are a helpful educational assistant. When a student asks a question, "
        "use the content from their transcript to answer. If the answer is not in the transcript, "
        "you may explain with general knowledge. Do not make up things not grounded in either the transcript or known facts."
    )

    if history is None:
        history = []
    #adds system prompt and transcript, and any previous history to the messages, appends new question
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Transcript:\n{transcript}"}
    ]

    messages.extend(history)

    messages.append({"role": "user", "content": question})

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        #more creative responses
        temperature=0.7,
        #size of message it can take, for performance
        max_tokens=1000,
    )

    answer = response.choices[0].message.content
    history.append({"role": "user", "content": question})
    history.append({"role": "assistant", "content": answer})

    return answer, history
