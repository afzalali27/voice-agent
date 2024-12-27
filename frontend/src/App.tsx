import React, { useState } from "react";
import "regenerator-runtime/runtime";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const handleTextSubmit = async () => {
    if (!userInput.trim()) {
      toast.error("Please enter some text.");
      return;
    }
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/process-input/?text_input=${encodeURIComponent(userInput)}`
      );
      setResponse(res.data.response);
      playAudio(res.data.response);
    } catch (error) {
      console.error(error);
      toast.error("Error processing your request.");
    }
  };

  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error("Browser does not support speech recognition.");
      return;
    }
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const handleVoiceSubmit = async () => {
    if (!transcript.trim()) {
      toast.error("No voice input detected. Please try again.");
      return;
    }
    try {
      const res = await axios.post(`http://127.0.0.1:8000/process-input/?text_input=${encodeURIComponent(transcript)}`);
      setResponse(res.data.response);
      playAudio(res.data.response);
      resetTranscript();
    } catch (error) {
      console.error(error);
      toast.error("Error processing your request.");
    }
  };

  const playAudio = (text: string) => {
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Voice Agent</h1>
      <div style={{ marginBottom: "20px" }}>
        <textarea
          rows={4}
          placeholder="Type your query here..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          style={{ width: "100%", padding: "10px" }}
        />
        <button onClick={handleTextSubmit} style={{ marginTop: "10px" }}>
          Submit Text
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <p>Microphone: {listening ? "ON" : "OFF"}</p>
        <button onClick={startListening} style={{ marginRight: "10px" }}>
          Start Listening
        </button>
        <button onClick={stopListening}>Stop Listening</button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <p>Transcript:</p>
        <textarea
          rows={4}
          value={transcript}
          placeholder="Your voice input will appear here..."
          readOnly
          style={{ width: "100%", padding: "10px" }}
        />
        <button onClick={handleVoiceSubmit} style={{ marginTop: "10px" }}>
          Submit Voice
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Response:</h3>
        <p>{response}</p>
      </div>

      <ToastContainer />
    </div>
  );
};

export default App;
