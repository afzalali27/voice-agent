from fastapi import FastAPI, UploadFile
from pydantic import BaseModel
import speech_recognition as sr
import logging
from groq import Groq
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Set up the OpenAI API key
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)

@app.get("/")
async def root():
    return {"message": "Hello, Voice Agent!"}


# Define a data model for the input
class UserInput(BaseModel):
    text: str

@app.post("/process-input/")
async def process_input(text_input: str = None, audio_file: UploadFile = None):
    if audio_file:
        recognizer = sr.Recognizer()
        with sr.AudioFile(audio_file.file) as source:
            audio_data = recognizer.record(source)
        try:
            input_text = recognizer.recognize_google(audio_data).lower()
            logging.info(f"Transcribed input: {input_text}")
        except sr.UnknownValueError:
            return {"response": "I couldn’t understand the audio. Please try again."}
        except sr.RequestError as e:
            return {"response": f"Error with the speech recognition service: {e}"}
    elif text_input:
        input_text = text_input.lower()
    else:
        return {"response": "No input provided."}

    # Use Groq to process input text dynamically
    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": input_text}],
        )

        ai_response = response.choices[0].message.content
        return {"response": ai_response}

    except Exception as e:
        return {"response": f"Error processing input: {str(e)}"}
    