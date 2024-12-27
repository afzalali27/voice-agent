from fastapi import FastAPI, File, UploadFile, Depends, Body
from typing import Optional
from pydantic import BaseModel
import speech_recognition as sr
import logging

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

    if "schedule" in input_text and "appointment" in input_text:
        return {"response": "Sure, I can help schedule an appointment. What date and time work for you?"}
    elif "reserve" in input_text and "restaurant" in input_text:
        return {"response": "Great! Which restaurant and what time should I book the reservation for?"}
    else:
        return {"response": "I’m sorry, I didn’t understand that. Can you please rephrase?"}