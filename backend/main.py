from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello, Voice Agent!"}


# Define a data model for the input
class UserInput(BaseModel):
    text: str

@app.post("/process-input/")
async def process_input(user_input: UserInput):
    input_text = user_input.text.lower()

    if "schedule" in input_text and "appointment" in input_text:
        return {"response": "Sure, I can help schedule an appointment. What date and time work for you?"}
    elif "reserve" in input_text and "restaurant" in input_text:
        return {"response": "Great! Which restaurant and what time should I book the reservation for?"}
    else:
        return {"response": "I’m sorry, I didn’t understand that. Can you please rephrase?"}
